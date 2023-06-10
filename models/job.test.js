"use strict";
process.env.NODE_ENV = 'test';

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIdTest
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", () => {
    const newJob = {
        title: "Job",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1"
    };

    test('works', async () => {
        let job = await Job.create(newJob);
        expect(job).toEqual({
            ...newJob,
            id: expect.any(Number)});
    });
});

/************************************** findAll */

describe('findAll', () => {
    test('works: no filter', async () => {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: jobIdTest[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1",
            },
            {
                id: jobIdTest[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            },
            {
                id: jobIdTest[2],
                title: "Job3",
                salary: 300,
                equity: "0",
                companyHandle: "c1",
                companyName: "C1",
            },
            {
                id: jobIdTest[3],
                title: "Job4",
                salary: null,
                equity: null,
                companyHandle: "c1",
                companyName: "C1",
            }
        ]);
    });

    test('works: by min salary', async () => {
        let jobs = await Job.findAll({ minSalary: 250});
        expect(jobs).toEqual([
            {
                id: jobIdTest[2],
                title: "Job3",
                salary: 300,
                equity: "0",
                companyHandle: "c1",
                companyName: "C1",
            }
        ]);
    });

    test('works: by equity', async () => {
        let jobs = await Job.findAll({ hasEquity: true});
        expect(jobs).toEqual([
            {
                id: jobIdTest[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1",
            },
            {
                id: jobIdTest[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            }
        ]);
    });

    test('works: by min salary and equity', async () => {
        let jobs = await Job.findAll({ minSalary: 200, hasEquity: true });
        expect(jobs).toEqual([
            {
                id: jobIdTest[1],
                title: "Job2",
                salary: 200,
                equity: "0.2",
                companyHandle: "c1",
                companyName: "C1",
            }
        ]);
    });

    test('works: by title', async () => {
        let jobs = await Job.findAll({ title: "ob1"});
        expect(jobs).toEqual([
            {
                id: jobIdTest[0],
                title: "Job1",
                salary: 100,
                equity: "0.1",
                companyHandle: "c1",
                companyName: "C1",
            }
        ]);
    });
});

/************************************** get */

describe('get', () => {
    test('works', async () => {
        let job = await Job.get(jobIdTest[0]);
        expect(job).toEqual({
            id: jobIdTest[0],
            title: "Job1",
            salary: 100,
            equity: "0.1",
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img"
            }
        });
    });

    test('not found if no such job', async () => {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe('update', () => {
    const updateData = {
        title: "New",
        salary: 5000,
        equity: "0.5"
    };

    test('works', async () => {
        let job = await Job.update(jobIdTest[0], updateData);
        expect(job).toEqual({
            id: jobIdTest[0],
            companyHandle: "c1",
            ... updateData
        });
    });

    test("not found if no such job", async () => {
        try {
          await Job.update(0, {
            title: "test",
          });
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async () => {
        try {
          await Job.update(jobIdTest[0], {});
          fail();
        } catch (err) {
          expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe('remove', () => {
    test('works', async () => {
        await Job.remove(jobIdTest[0]);
        const res = await db.query(`SELECT id FROM jobs WHERE id = $1`, [jobIdTest[0]]);

        expect(res.rows.length).toEqual(0);
    });

    test('No found if no such job', async () => {
        try {
            await Job.remove(999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});