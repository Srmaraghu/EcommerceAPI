const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index"); // Adjust the path as necessary
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

chai.use(chaiHttp);
const { expect } = chai;

describe("User Authentication API", () => {
    // Clean up the database before tests
    before(async () => {
        await User.deleteMany(); // Ensure you start with a clean slate
    });

    describe("POST /api/auth/register", () => {
        it("should register a new user", async () => {
            const res = await chai.request(app)
                .post("/api/auth/register")
                .send({
                    name: "Test User",
                    email: "testuser@example.com",
                    password: "password123"
                });

            expect(res.status).to.equal(201);
            expect(res.body.message).to.equal("User registered successfully");
            expect(res.body.success).to.be.true;

            // Verify that the user was created in the database
            const user = await User.findOne({ email: "testuser@example.com" });
            expect(user).to.not.be.null;
            expect(user.name).to.equal("Test User");
            expect(user.email).to.equal("testuser@example.com");
            expect(user.password).to.not.equal("password123"); // Ensure password is hashed
        });

        it("should not register a user with an existing email", async () => {
            // Register the user first
            await chai.request(app)
                .post("/api/auth/register")
                .send({
                    name: "Duplicate User",
                    email: "duplicate@example.com",
                    password: "password123"
                });

            const res = await chai.request(app)
                .post("/api/auth/register")
                .send({
                    name: "Duplicate User",
                    email: "duplicate@example.com",
                    password: "password123"
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal("User already exists");
        });

        
    });

    describe("POST /api/auth/login", () => {
        before(async () => {
            // Create a user for testing login
            const hashedPassword = await bcrypt.hash("password123", 10);
            await User.create({
                name: "Test Login User",
                email: "loginuser@example.com",
                password: hashedPassword
            });
        });

        it("should log in a user with valid credentials", async () => {
            const res = await chai.request(app)
                .post("/api/auth/login")
                .send({
                    email: "loginuser@example.com",
                    password: "password123"
                });

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Login Successful");
            expect(res.body.success).to.be.true;
            expect(res.body.token).to.exist; // Token should be present
        });

        it("should not log in a user with invalid credentials", async () => {
            const res = await chai.request(app)
                .post("/api/auth/login")
                .send({
                    email: "loginuser@example.com",
                    password: "wrongpassword"
                });

            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal("Invalid password");
        });

        it("should not log in a user that does not exist", async () => {
            const res = await chai.request(app)
                .post("/api/auth/login")
                .send({
                    email: "nonexistent@example.com",
                    password: "password123"
                });

            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal("User not found");
        });

     
    });
});
