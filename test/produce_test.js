const Produce = artifacts.require("Produce");
const Log = artifacts.require("Log");

contract("Produce", async accounts => {

    let produce;
    const produceName = "Tomatoes";
    const produceDescription = "My favorite veg";
    const producePrice = 3;
    //const produceQuantity = 12;
    const url = "www.wangcongshu.com";
    const imageURL = "https://www.heart.org/-/media/aha/h4gm/article-images/fruit-and-vegetables.jpg?la=en&hash=65387BD7AEEF9C37F30838E6A897796400EE80F4";

    const owner = accounts[0];
    const beneficiary = accounts[1];

    beforeEach (async () => {
        produce = await Produce.new(
            produceName, 
            produceDescription, 
            producePrice, 
            //produceQuantity,  
            url, 
            imageURL,
            owner,
            beneficiary
        );
    });

    describe("initialization", () => {

        it("gets the produce name", async() => {
            const actualProduceName = await produce.produceName();
            assert.equal(actualProduceName, produceName, "produce name should match");
        });

        it("gets the produce description", async() => {
         const actualProduceDescription = await produce.produceDescription();
         assert.equal(actualProduceDescription, produceDescription, "produce description should match");
        });

        it("gets the produce price", async() => {
         const actualProducePrice = await produce.producePrice();
         assert.equal(actualProducePrice, producePrice, "produce price should match");
        });

        // it("gets the produce quantity", async() => {
        //  const actualProduceQuantity = await produce.produceQuantity();
        //  assert.equal(actualProduceQuantity, produceQuantity, "produce quantity should match");
        // });

        it("gets the produce url", async() => {
         const actualURL = await produce.url();
         assert.equal(actualURL, url, "produce url should match");
        });

        it("gets the produce image url", async() => {
         const actualImageURL = await produce.imageURL();
         assert.equal(actualImageURL, imageURL, "produce image url should match");
        });

        it("gets the owner", async() => {
         const actualOwner = await produce.owner();
         assert.equal(actualOwner, owner, "owner should match");
        });

        it("gets the beneficiary", async() => {
         const actualBeneficiary = await produce.beneficiary();
         assert.equal(actualBeneficiary, beneficiary, "beneficiary should match");
        });
    });

    describe("set beneficiary", () => {
        
        const newBeneficiary = accounts[2];

        it("updated beneficiary when called by owner account", async () => {
            await produce.setBeneficiary(newBeneficiary, {from: owner});
            const actualBeneficiary = await produce.beneficiary();
            assert.equal(actualBeneficiary, newBeneficiary, "beneficiary should match");
        });

        it("throws an error when called from a non-owner account", async () => {
            try {
                await produce.setBeneficiary(newBeneficiary, {from: accounts[3]});
                assert.fail("withdraw was not restricted to owner");
            } catch (err) {
                const expectedError = "Ownable: caller is not the owner";
                const actualError = err.reason
                assert.equal(expectedError, actualError, "should not be permitted");
            }
        });
    });

    describe("make purchases", () => {
        const value = web3.utils.toWei('0.0289');
        const buyer = accounts[3];


        it("increases buyer purchase count", async () => {
            const previousBuyerPurchasesCount = await produce.getBuyerPurchasesCount({from: buyer});
            await produce.purchase({from: buyer, value});
            const currentBuyerPurchasesCount = await produce.getBuyerPurchasesCount({from: buyer});
            assert.equal(1, currentBuyerPurchasesCount - previousBuyerPurchasesCount, "buyer purchase count should increase by 1");
        });

        it("adds purchase to purchase history", async () => {
            await produce.purchase({from: buyer, value});
            const {values, dates} = await produce.getBuyerPurchasesHistory({from: buyer});
            assert.equal(value, values[0], "purchase value should match");
            assert(dates[0], "date should exist");
        });

        it("increases total purchase count", async () => {
            const previousTotalPurchasesCount = await produce.totalPurchasesCount();
            await produce.purchase({from: buyer, value});
            const currentTotalPurchasesCount = await produce.totalPurchasesCount();
            assert.equal(1, currentTotalPurchasesCount - previousTotalPurchasesCount, "total purchase count should increase by 1");
        });

        it("increases total purchase amount", async () => {
            const previousTotalPurchasesAmount = await produce.totalPurchasesAmount();
            await produce.purchase({from: buyer, value});
            const currentTotalPurchasesAmount = await produce.totalPurchasesAmount();
            assert.equal(value, currentTotalPurchasesAmount - previousTotalPurchasesAmount, "total purchase amount should match");
        });

        it("emits the purchase received event", async () => {
            const tx = await produce.purchase({from: buyer, value});
            const expectedEvent = "PurchaseReceived";
            const actualEvent = tx.logs[0].event;
            assert.equal(actualEvent, expectedEvent, "events should match");
        });
    });

    describe("withdrawing incomes", () => {
        beforeEach(async () => {
            await produce.purchase({from: accounts[4], value: web3.utils.toWei('0.1')});
        });

        describe("access controls", () => {

            it("throws an error when called from a non-owner account", async () => {
                try {
                    await produce.withdrawIncomes({from: accounts[5]});
                    assert.fail("withdrawing was not restricted to owners")
                } catch(err) {
                    const expectedError = "Ownable: caller is not the owner";
                    const actualError = err.reason;
                    assert.equal(actualError, expectedError, "withdraw should not be permitted");
                }
            });

            it("allows the owner to withdraw incomes", async () => {
                try {
                    await produce.withdrawIncomes({from: owner});
                    assert(true, "no errors were thrown");
                } catch (err) {
                    assert.fail("withdraw should be permitted");
                }
            });

            it("transfers incomes to beneficiary", async () => {
                const previousContractBalance = await web3.eth.getBalance(produce.address);
                const previousBeneficiaryBalance = await web3.eth.getBalance(beneficiary);
                await produce.withdrawIncomes({from: owner});
                const currentContractBalance = await web3.eth.getBalance(produce.address);
                const currentBeneficiaryBalance = await web3.eth.getBalance(beneficiary);
                assert.equal(0, currentContractBalance, "contract should have 0 balance");
                assert.equal(currentBeneficiaryBalance - previousBeneficiaryBalance, previousContractBalance, "beneficiary should receive all incomes");
            });

            it("emits withdraw event", async () => {
                const tx = await produce.withdrawIncomes({from: owner});
                const expectedEvent = "Withdraw";
                const actualEvent = tx.logs[0].event;
                assert.equal(actualEvent, expectedEvent, "events should match");
            });
        });
    });

    describe("add log", () => {
        const logDescription = "my care description";
        const logImageURL = "test url";

        it("throws an error when called from a non-owner account", async () => {
            try {
                await produce.addLog(logDescription, logImageURL, {from: accounts[3]});
                assert.fail("add log was not restricted to owner");
            } catch (err) {
                const expectedError = "Ownable: caller is not the owner";
                const actualError = err.reason
                assert.equal(expectedError, actualError, "should not be permitted");
            }
        });

        it("increases total log count", async () => {
            const previousLogCount = await produce.logCount();
            await produce.addLog(logDescription, logImageURL, {from: owner});
            const currentLogCount = await produce.logCount();
            assert.equal(1, currentLogCount - previousLogCount, "log count should increase by 1");
        });

        it("gets all logs", async () => {
            await produce.addLog(logDescription, logImageURL, {from: owner});
            const logs = await produce.getLogs({from: accounts[3]});
            const log = await Log.at(logs[0]);
            const actualLogDescription = await log.logDescription();
            const actualLogImageURL = await log.logImageURL();
            assert.equal(logDescription, actualLogDescription, "log description should match");
            assert.equal(logImageURL, actualLogImageURL, "log image URL should match");
        });

        it("emits log added event", async () => {
            const tx = await produce.addLog(logDescription, logImageURL, {from: owner});
            const expectedEvent = "LogAdded";
            const actualEvent = tx.logs[0].event;
            assert.equal(actualEvent, expectedEvent, "events should match");
        });

        it("respects log limit", async () => {
            for (let i = 0; i < 12; i++) {
                await produce.addLog(`${logDescription} ${i}`, `${logImageURL} ${i}`, {from: owner});
            }
            const logs = await produce.getLogs({from: accounts[3]});
            
            const firstLog = await Log.at(logs[0]);
            const firstLogActualLogDescription = await firstLog.logDescription();
            const firstLogActualLogImageURL = await firstLog.logImageURL();
            assert.equal("my care description 2", firstLogActualLogDescription, "first log description should match");
            assert.equal("test url 2", firstLogActualLogImageURL, "first log image URL should match");

            const lastLog = await Log.at(logs[9]);
            const lastLogActualLogDescription = await lastLog.logDescription();
            const lastLogActualLogImageURL = await lastLog.logImageURL();
            assert.equal("my care description 11", lastLogActualLogDescription, "last log description should match");
            assert.equal("test url 11", lastLogActualLogImageURL, "last log image URL should match");
        });
    });

    describe("fallback function", () => {
        const value = web3.utils.toWei('1.1235');

        it("increases total purchase count", async () => {
            const previousTotalPurchasesCount = await produce.totalPurchasesCount();
            await web3.eth.sendTransaction({to: produce.address, from: accounts[9], value});
            const currentTotalPurchasesCount = await produce.totalPurchasesCount();
            assert.equal(1, currentTotalPurchasesCount - previousTotalPurchasesCount, "total purchase count should increase by 1");
        });

        it("increases total purchase amount", async () => {
            const previousTotalPurchasesAmount = await produce.totalPurchasesAmount();
            await web3.eth.sendTransaction({to: produce.address, from: accounts[9], value});
            const currentTotalPurchasesAmount = await produce.totalPurchasesAmount();
            assert.equal(value, currentTotalPurchasesAmount - previousTotalPurchasesAmount, "total purchase amount should match");
        });
    });
});