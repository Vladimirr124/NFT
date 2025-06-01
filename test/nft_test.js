const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupetUniqueToken", function () {
  let token;
  let owner, addr1, addr2;
  const price = ethers.parseEther("0.1");
  const maxSupply = 3;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("SupetUniqueToken");
    token = await Token.deploy(owner.address, price, maxSupply);
    await token.waitForDeployment();
  });

  it("should deploy with correct owner", async function () {
    expect(await token.owner()).to.equal(owner.address);
  });

  it("should mint a token via safeMint only once per address", async function () {
    await token.safeMint(addr1.address);
    expect(await token.balanceOf(addr1.address)).to.equal(1);

    await expect(token.safeMint(addr1.address)).to.be.revertedWith("Address already owns a token");
  });

  it("should not allow non-owner to call safeMint", async function () {
    await expect(token.connect(addr1).safeMint(addr1.address))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
  });

  it("should allow buying a token if payment and conditions are correct", async function () {
    await token.connect(addr1).buy(addr1.address, { value: price });
    expect(await token.balanceOf(addr1.address)).to.equal(1);
  });

  it("should fail if payment is insufficient", async function () {
    await expect(token.connect(addr1).buy(addr1.address, { value: ethers.parseEther("0.01") }))
      .to.be.revertedWith("Insufficient payment");
  });

  it("should fail if address already owns a token", async function () {
    await token.connect(addr1).buy(addr1.address, { value: price });
    await expect(token.connect(addr1).buy(addr1.address, { value: price }))
      .to.be.revertedWith("Address already owns a token");
  });

  it("should fail if max supply is reached", async function () {
    await token.connect(addr1).buy(addr1.address, { value: price });
    await token.connect(addr2).buy(addr2.address, { value: price });
    await token.safeMint(owner.address); // Third token

    await expect(token.buy(owner.address, { value: price }))
      .to.be.revertedWith("Max supply reached");
  });

  it("should allow owner to withdraw balance", async function () {
    await token.connect(addr1).buy(addr1.address, { value: price });

    const balanceBefore = await ethers.provider.getBalance(owner.address);
    const tx = await token.connect(owner).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const balanceAfter = await ethers.provider.getBalance(owner.address);
    expect(balanceAfter).to.be.greaterThan(balanceBefore - gasUsed);
  });

  it("should revert withdraw if balance is zero", async function () {
    await expect(token.withdraw()).to.be.revertedWith("No balance to withdraw");
  });

  it("should return correct base URI", async function () {
    const uri = await token.tokenURI(0).catch(() => null);
    // tokenURI will fail unless token 0 exists, so we mint first
    await token.safeMint(owner.address);
    expect(await token.tokenURI(0)).to.equal("https://www.miladymaker.net/milady/json/8918" + "0");
  });
});
