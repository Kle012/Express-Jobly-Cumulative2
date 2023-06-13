"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = express.Router({ mergeParams: true });


/** POST / { job } => { job } 
 * 
 * job should be { title, salary, equity, companyHandle }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin only
 * 
*/

router.post("/", ensureAdmin, async (req, res, next) =>{
    try {
        const result = jsonschema.validate(req.body, jobNewSchema);
        if(!result.valid) {
            const listErrors = result.errors.map(error => error.stack);
            throw new BadRequestError(listErrors);
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

/** GET/ =>
 * { jobs: [ { id, title, salary, equity, companyHandle }, ... ] }
 * 
 * Can filter on provided search filters:
 * - title (will find case-sensitive, partial matches)
 * - minSalary
 * - hasEquity (true returns only jobs with equity > 0, other values ignored)
 * 
 * Authorization required: none
 * 
 */

router.get("/", async (req, res, next) => {
    let q = req.query;

    // Arrive as strings from queryString, then convert it to ints and bool
    if (q.minSalary !== undefined) q.minSalary =+q.minSalary;
    q.hasEquity = q.hasEquity === "true";

    try {
        const result = jsonschema.validate(q, jobSearchSchema);
        if (!result.valid){
            let listErrors = result.errors.map(error => error.stack);
            throw new BadRequestError(listErrors);
        }

        const jobs = await Job.findAll(q);
        return res.json({ jobs });
    } catch (err) {
        return next(err);
    }
});

/** GET /[id] => { job } 
 * 
 * Job is { id, title, salary, equity, company }
 *  where company is { handle, name, description, numEmployees, logoUrl }
 * 
 * Authorization required: none
 * 
*/

router.get("/:id", async (req, res, next) => {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] {fld1, fld2, ...} => { job }
 * 
 * Patches job data.
 * 
 * fields can be: { title, salary, equity }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin only
 * 
*/

router.patch("/:id", ensureAdmin, async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, jobUpdateSchema);
        if (!result.valid){
            let listErrors = result.errors.map(error => error.stack);
            throw new BadRequestError(listErrors);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next (err);
    }
});

/** DELETE /[id] => { deleted: id }
 * 
 * Authorization required: admin only
 * 
*/

router.delete("/:id", ensureAdmin, async (req, res, next) => {
    try {
        await Job.remove(req.params.id);
        return res.json({ msg: "deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
