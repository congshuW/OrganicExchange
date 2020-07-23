const ProduceFactory = artifacts.require("ProduceFactory");
const Produce = artifacts.require("Produce");

contract("ProduceFactory: deployment", () => {
	it("has been deployed", async () => {
		const produceFactory = await ProduceFactory.deployed();
		assert(produceFactory, "produce factory was not deployed");
	});
});

contract("ProduceFactory: create produce", (accounts) => {
	let produceFactory;

	const produceName = "Tomatoes";
    const produceDescription = "My favorite veg";
    const producePrice = 3;
    //const produceQuantity = 12;
    const url = "www.wangcongshu.com";
    const imageURL = "https://www.heart.org/-/media/aha/h4gm/article-images/fruit-and-vegetables.jpg?la=en&hash=65387BD7AEEF9C37F30838E6A897796400EE80F4";
    const beneficiary = accounts[1];

    it("increases the produce count", async () => {
    	produceFactory = await ProduceFactory.deployed();
    	const previousProduceCount = await produceFactory.produceCount();
    	await produceFactory.createProduce(
    		produceName,
    		produceDescription,
    		producePrice,
    		// produceQuantity,
    		url,
    		imageURL,
    		beneficiary
    	);
    	const currentProduceCount = await produceFactory.produceCount();
    	assert.equal(1, currentProduceCount - previousProduceCount, "should increase by 1");
    });

    it("emits the produce created event", async () => {
    	produceFactory = await ProduceFactory.deployed();
    	const tx = await produceFactory.createProduce(
    		produceName,
    		produceDescription,
    		producePrice,
    		// produceQuantity,
    		url,
    		imageURL,
    		beneficiary
    	);
    	const expectedEvent = "ProduceCreated";
    	const actualEvent = tx.logs[0].event;
    	assert.equal(expectedEvent, actualEvent, "events should match");
    });
});

contract("ProduceFactory: produces", (accounts) => {
	async function createProduceFactory(produceCount, accounts) {
		const produceFactory = await ProduceFactory.new();
		await addProduce(produceFactory, produceCount, accounts);
		return produceFactory;
	}

	async function addProduce(produceFactory, produceCount, accounts) {
		const name = "veg";
		const lowerCaseName = name.toLowerCase();
		const produceDescription = "test description";
		const producePrice = 23;
		const beneficiary = accounts[1];

		for (let i = 0; i < produceCount; i++) {
			await produceFactory.createProduce(
	    		`${name}${i}`,
	    		`${produceDescription} ${i}`,
	    		producePrice,
	    		// produceQuantity,
	    		`${lowerCaseName}${i}.com`,
	    		`${lowerCaseName}${i}.png`,
	    		beneficiary
    		);
		}
	}

	describe("when produce collection is empty", () => {
		it("returns an empty collection", async () => {
			const factory = await createProduceFactory(0, accounts);
			const produces = await factory.produces(10, 0);
			assert.equal(0, produces.length, "collection should be empty");
		});
	});

	describe("varying limits", async () => {
		let factory;
		beforeEach(async () => {
			factory = await createProduceFactory(30, accounts);
		});

		it("returns 10 results when limit requested is 10", async () => {
			const produces = await factory.produces(10, 0);
			assert.equal(10, produces.length, "results size should be 10");
		});

		it("returns 20 results when limit requested is 20", async () => {
			const produces = await factory.produces(20, 0);
			assert.equal(20, produces.length, "results size should be 20");
		});

		it("returns 20 results when limit requested is 30", async () => {
			const produces = await factory.produces(30, 0);
			assert.equal(20, produces.length, "results size should be 20");
		});
	});

	describe("varying offset", () => {
		let factory;
		beforeEach(async () => {
			factory = await createProduceFactory(10, accounts);
		});

		it("contains the produce with the appropriate offset", async () => {
			const produces = await factory.produces(1, 0);
			const produce = await Produce.at(produces[0]);
			const name = await produce.produceName();
			assert.ok(await name.includes(0), "${name} did not include the offset");
		});

		it("contains the produce with the appropriate offset", async () => {
			const produces = await factory.produces(1, 7);
			const produce = await Produce.at(produces[0]);
			const name = await produce.produceName();
			assert.ok(await name.includes(7), "${name} did not include the offset");
		});
	});

	describe("boundary conditions", () => {
		let factory;
		beforeEach(async () => {
			factory = await createProduceFactory(10, accounts);
		});

		it("raises out of bounds error", async () => {
			try {
				await factory.produces(1, 11);
				assert.fail("error was not raised");
			} catch(err) {
				const expected = "offset out of bounds";
				assert.ok(err.message.includes(expected), `${err.message}`);
			}
		});

		it("adjusts return size to prevent out of bounds error", async () => {
			try {
				const produces = await factory.produces(10, 5);
				assert.equal(5, produces.length, "produces adjusted");
			} catch(err) {
				assert.fail("limit and offset exceedded bounds");
			}
		});
	});
});