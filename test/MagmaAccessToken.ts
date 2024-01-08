import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const uri = "http://test.com";

describe("MagmaAccessToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTokenFixture() {


    // Contracts are deployed using the first signer/account by default
    const [
      owner,
      tokenAdministrator,
      secondaryTokenAdministrator,
      otherAddress
    ] = await ethers.getSigners();

    const DigitalTwinToken = await ethers.getContractFactory("MagmaAccessToken");
    const dtt = await DigitalTwinToken.deploy(
      uri,
      tokenAdministrator.address
    );

    return {
      dtt,
      uri,
      tokenAdministrator,
      secondaryTokenAdministrator,
      otherAddress
    };
  }

  describe("Magma Access Token", async function () {


    it("Should set the contract properly", async function () {
      const {
        dtt,
        uri,
        tokenAdministrator
      } = await loadFixture(deployTokenFixture);

      expect(await dtt.uri(123)).to.equal(uri);
      expect(await dtt.tokenAdministrator()).to.equal(tokenAdministrator.address);
    });

    it("Should have a token administrator that can be changed", async function () {
      const {
        dtt,
        tokenAdministrator,
        secondaryTokenAdministrator,
        otherAddress
      } = await loadFixture(deployTokenFixture);

      await dtt.connect(tokenAdministrator).setTokenAdministrator(secondaryTokenAdministrator.address)
      expect(await dtt.tokenAdministrator()).to.equal(secondaryTokenAdministrator.address);

      // this shouldn't work.
      await expect(dtt.connect(otherAddress).setTokenAdministrator(otherAddress.address)).to.be.revertedWith("sender must be tokenAdministrator");
    });


    it("Should allow tokens to be minted by administrator", async function () {
      const {
        dtt,
        tokenAdministrator,
        otherAddress
      } = await loadFixture(deployTokenFixture);

      const myToken = 123;
      const ONE_WEI = 1_000_000_000;

      expect(await dtt.balanceOf(otherAddress.address, myToken)).to.equal(0);

      await dtt.connect(tokenAdministrator).mint(otherAddress.address, myToken, ONE_WEI, [])
      expect(await dtt.balanceOf(otherAddress.address, myToken)).to.equal(ONE_WEI);

      const anotherToken = 234;

      // this shouldn't work.
      await expect(dtt.connect(otherAddress).mint(otherAddress.address, anotherToken, ONE_WEI, [])).to.be.revertedWith("sender must be tokenAdministrator");

    });

    it("Should allow setUri to be called by administrator", async function () {
      const {
        dtt,
        tokenAdministrator,
        otherAddress
      } = await loadFixture(deployTokenFixture);

      expect(await dtt.uri(0)).to.equal(uri);

      const newUri = "http://newUri.com/{id}";
      await dtt.connect(tokenAdministrator).setUri(newUri)
      expect(await dtt.uri(0)).to.equal(newUri);

      // this shouldn't work.
      await expect(dtt.connect(otherAddress).setUri("http://spam.com")).to.be.revertedWith("sender must be tokenAdministrator");

    });

  });
});