const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index");
const Product = require("../models/product.model.js");
const path = require("path");

chai.use(chaiHttp);
const { expect } = chai;

let token;
let productId; // This will hold the ID of the product created in the POST test.

describe("Product API", () => {
    // Authenticate once before all tests
    before(async () => {
        const res = await chai.request(app)
            .post("/api/auth/login")
            .send({ email: "admin1@gmail.com", password: "admin" });

        token = res.body.token;
    });

    describe("POST /api/products", () => {
        it("should create a new product", async () => {
            const res = await chai.request(app)
                .post("/api/products")
                .set("Cookie", `token=${token}`)
                .field("name", "Test Product")
                .field("price", 100)
                .field("description", "Test Description")
                .field("stockQuantity", 10)
                .attach("image", path.resolve(__dirname, "../images/Grey Shirt.jpg"));

            expect(res.status).to.equal(200);
            expect(res.body.product.name).to.equal("Test Product");
            productId = res.body.product._id; // Store productId for later tests
        });
    });

    describe("GET /api/products", () => {
        it("should retrieve all products", async () => {
            const res = await chai.request(app)
                .get("/api/products")
                .set("Cookie", `token=${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.products).to.be.an("array");
        });

        it("should retrieve products by name", async () => {
            const res = await chai.request(app)
                .get("/api/products")
                .query({ search: "Shirt" })
                .set("Cookie", `token=${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.products).to.be.an("array");
        });
    });

    describe("PUT /api/products/:id", () => {
        let updateProductId;

        // Create a product before updating it
        beforeEach(async () => {
            const product = await Product.create({
                name: "Product to Update",
                price: 200,
                description: "Update Test",
                stockQuantity: 5,
            });
            updateProductId = product._id; 

        });

        it("should update an existing product", async () => {
            // console.log("Updating product with ID:", updateProductId); 
            const res = await chai.request(app)

                .put(`/api/products/${updateProductId}`)
                .set("Cookie", `token=${token}`)
                .send({ name: "Updated Product", price: 12 });
                // console.log("Response from update request:", res.body); 

            expect(res.status).to.equal(200);
            expect(res.body.product.name).to.equal("Updated Product");
        });
    });

    describe("DELETE /api/products/:id", () => {
        let deleteProductId;
    
        beforeEach(async () => {
            const product = await Product.create({
                name: "Product to Delete",
                price: 200,
                description: "Delete Test",
                stockQuantity: 5,
            });
            deleteProductId = product._id; 
            console.log("Created Product ID:", deleteProductId); // Debugging line
        });
    
        it("should delete the product", async () => {
            const res = await chai.request(app)
                .delete(`/api/products/delete/${deleteProductId}`)
                .set("Cookie", `token=${token}`);
    
            
    
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal("Product deleted successfully");
        });
    });
    
});
