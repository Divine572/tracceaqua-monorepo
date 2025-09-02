import { expect } from "chai";
import { ethers } from "hardhat";
import { TracceAqua } from "../typechain-types";

import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";


describe("TracceAqua", function () {
    let tracceAqua: TracceAqua;
    let admin: SignerWithAddress;
    let researcher: SignerWithAddress;
    let farmer: SignerWithAddress;
    let consumer: SignerWithAddress;

    beforeEach(async function () {
        [admin, researcher, farmer, consumer] = await ethers.getSigners();

        const TracceAqua = await ethers.getContractFactory("TracceAqua");
        tracceAqua = await TracceAqua.deploy();
        await tracceAqua.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right admin", async function () {
            expect(await tracceAqua.hasRole(await tracceAqua.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
        });

        it("Should return correct name and version", async function () {
            expect(await tracceAqua.getName()).to.equal("TracceAqua");
            expect(await tracceAqua.getVersion()).to.equal("1.0.0");
        });
    });

    describe("Role Management", function () {
        it("Should grant researcher role", async function () {
            const RESEARCHER_ROLE = await tracceAqua.RESEARCHER_ROLE();
            
            await tracceAqua.grantUserRole(RESEARCHER_ROLE, researcher.address);
            
            expect(await tracceAqua.hasRole(RESEARCHER_ROLE, researcher.address)).to.be.true;
            expect(await tracceAqua.isUserAuthorized(researcher.address)).to.be.true;
        });

        it("Should revoke user role", async function () {
            const RESEARCHER_ROLE = await tracceAqua.RESEARCHER_ROLE();
            
            await tracceAqua.grantUserRole(RESEARCHER_ROLE, researcher.address);
            await tracceAqua.revokeUserRole(RESEARCHER_ROLE, researcher.address);
            
            expect(await tracceAqua.hasRole(RESEARCHER_ROLE, researcher.address)).to.be.false;
        });
    });

    describe("Conservation Records", function () {
        beforeEach(async function () {
            const RESEARCHER_ROLE = await tracceAqua.RESEARCHER_ROLE();
            await tracceAqua.grantUserRole(RESEARCHER_ROLE, researcher.address);
        });

        it("Should create conservation record", async function () {
            const samplingId = "SAMPLE_001";
            const dataHash = "QmHash123";

            await tracceAqua.connect(researcher).createConservationRecord(samplingId, dataHash);

            const record = await tracceAqua.getConservationRecord(samplingId);
            expect(record.samplingId).to.equal(samplingId);
            expect(record.dataHash).to.equal(dataHash);
            expect(record.researcher).to.equal(researcher.address);
            expect(record.verified).to.be.false;
        });

        it("Should prevent duplicate sampling IDs", async function () {
            const samplingId = "SAMPLE_001";
            const dataHash = "QmHash123";

            await tracceAqua.connect(researcher).createConservationRecord(samplingId, dataHash);

            await expect(
                tracceAqua.connect(researcher).createConservationRecord(samplingId, dataHash)
            ).to.be.revertedWith("TracceAqua: Sampling ID already exists");
        });

        it("Should verify conservation record", async function () {
            const samplingId = "SAMPLE_001";
            const dataHash = "QmHash123";

            await tracceAqua.connect(researcher).createConservationRecord(samplingId, dataHash);
            await tracceAqua.verifyConservationRecord(samplingId);

            const record = await tracceAqua.getConservationRecord(samplingId);
            expect(record.verified).to.be.true;
            expect(record.verifier).to.equal(admin.address);
        });
    });

    describe("Supply Chain Records", function () {
        beforeEach(async function () {
            const FARMER_ROLE = await tracceAqua.FARMER_ROLE();
            await tracceAqua.grantUserRole(FARMER_ROLE, farmer.address);
        });

        it("Should create supply chain record", async function () {
            const productId = "PROD_001";
            const dataHash = "QmHash456";
            const sourceType = "FARMED";
            const initialStage = "HATCHERY";

            await tracceAqua.connect(farmer).createSupplyChainRecord(
                productId, dataHash, sourceType, initialStage
            );

            const record = await tracceAqua.getSupplyChainRecord(productId);
            expect(record.productId).to.equal(productId);
            expect(record.sourceType).to.equal(sourceType);
            expect(record.currentStage).to.equal(initialStage);
            expect(record.creator).to.equal(farmer.address);
        });

        it("Should update supply chain stage", async function () {
            const productId = "PROD_001";
            const dataHash = "QmHash456";
            const sourceType = "FARMED";
            const initialStage = "HATCHERY";

            await tracceAqua.connect(farmer).createSupplyChainRecord(
                productId, dataHash, sourceType, initialStage
            );

            const newStage = "GROW_OUT";
            const newDataHash = "QmHash789";

            await tracceAqua.connect(farmer).updateSupplyChainStage(
                productId, newStage, newDataHash, "Moving to grow-out stage"
            );

            const record = await tracceAqua.getSupplyChainRecord(productId);
            expect(record.currentStage).to.equal(newStage);
            expect(record.dataHash).to.equal(newDataHash);
        });
    });

    describe("Statistics", function () {
        it("Should return correct counts", async function () {
            expect(await tracceAqua.getTotalConservationRecords()).to.equal(0);
            expect(await tracceAqua.getTotalSupplyChainRecords()).to.equal(0);
        });
    });
});
