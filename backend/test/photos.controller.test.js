const { expect } = require("chai");
const sinon = require("sinon");
const axios = require("axios");

const Photo = require("../src/models/photos.model.js");
const Album = require("../src/models/albums.model.js");
const photosController = require("../src/controllers/photos.controller.js");
const { createMockRes } = require("./helpers/mockRes.js");

describe("photos.controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("getPhotos", () => {
    it("returns active photos when no filters are passed", async () => {
      const fakePhotos = [{ name: "a.jpg" }, { name: "b.jpg" }];
      const fakeQuery = {
        sort: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        skip: sinon.stub().returns(fakePhotos),
      };
      const findStub = sinon.stub(Photo, "find").returns(fakeQuery);

      const req = { query: {} };
      const res = createMockRes();

      await photosController.getPhotos(req, res);

      expect(findStub.calledOnceWith({ flagUseStatus: true })).to.be.true;
      expect(fakeQuery.sort.calledWith({ createdAt: -1 })).to.be.true;
      expect(res.json.calledWith(fakePhotos)).to.be.true;
    });

    it("adds a case-insensitive $or filter across name, description and tags when searching", async () => {
      const fakeQuery = {
        sort: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        skip: sinon.stub().returns([]),
      };
      const findStub = sinon.stub(Photo, "find").returns(fakeQuery);

      const req = { query: { search: "sunset" } };
      const res = createMockRes();

      await photosController.getPhotos(req, res);

      const usedFilter = findStub.firstCall.args[0];
      expect(usedFilter.$or).to.have.lengthOf(3);
      expect(usedFilter.$or[0].name.test("A Sunset Hill")).to.be.true;
    });

    it("responds with 500 when the database call throws", async () => {
      sinon.stub(Photo, "find").throws(new Error("db down"));

      const req = { query: {} };
      const res = createMockRes();

      await photosController.getPhotos(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: "db down" })).to.be.true;
    });
  });

  describe("uploadPhoto", () => {
    it("responds with 400 when no file is attached", async () => {
      const req = { file: null, body: {} };
      const res = createMockRes();

      await photosController.uploadPhoto(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: "No file uploaded" })).to.be.true;
    });

    it("uploads to ImgBB and stores the photo with parsed tags", async () => {
      sinon.stub(axios, "post").resolves({
        data: { data: { url: "https://i.ibb.co/fake.jpg" } },
      });
      const createStub = sinon
        .stub(Photo, "create")
        .resolves({ _id: "1", name: "Sunset" });

      const req = {
        file: { buffer: Buffer.from("img"), originalname: "photo.png" },
        body: {
          name: "Sunset",
          description: "Nice view",
          tags: "sunset, hills ,  ",
        },
      };
      const res = createMockRes();

      await photosController.uploadPhoto(req, res);

      const created = createStub.firstCall.args[0];
      expect(created.name).to.equal("Sunset");
      expect(created.description).to.equal("Nice view");
      expect(created.tags).to.deep.equal(["sunset", "hills"]);
      expect(created.url).to.equal("https://i.ibb.co/fake.jpg");
      expect(res.status.calledWith(200)).to.be.true;
    });

    it("falls back to the file name when no name is provided", async () => {
      sinon.stub(axios, "post").resolves({
        data: { data: { url: "https://i.ibb.co/fake.jpg" } },
      });
      const createStub = sinon.stub(Photo, "create").resolves({ _id: "1" });

      const req = {
        file: { buffer: Buffer.from("img"), originalname: "raw.png" },
        body: {},
      };
      const res = createMockRes();

      await photosController.uploadPhoto(req, res);

      expect(createStub.firstCall.args[0].name).to.equal("raw.png");
      expect(createStub.firstCall.args[0].tags).to.deep.equal([]);
    });

    it("responds with 500 when the ImgBB upload fails", async () => {
      sinon.stub(console, "error"); // keep test output clean
      sinon.stub(axios, "post").rejects(new Error("network error"));

      const req = {
        file: { buffer: Buffer.from("img"), originalname: "photo.png" },
        body: {},
      };
      const res = createMockRes();

      await photosController.uploadPhoto(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(
        res.json.calledWith({ success: false, message: "Server error" }),
      ).to.be.true;
    });
  });

  describe("trashPhoto", () => {
    it("sets flagUseStatus to false", async () => {
      const fakePhoto = { _id: "1", flagUseStatus: false };

      // mock: assert the exact call was made, then verify it happened
      const mock = sinon.mock(Photo);
      mock
        .expects("findByIdAndUpdate")
        .once()
        .withArgs("1", { flagUseStatus: false }, { new: true })
        .resolves(fakePhoto);

      const req = { params: { id: "1" } };
      const res = createMockRes();

      await photosController.trashPhoto(req, res);

      mock.verify();
      mock.restore();
      expect(res.json.calledWith(fakePhoto)).to.be.true;
    });

    it("responds with 404 when the photo does not exist", async () => {
      sinon.stub(Photo, "findByIdAndUpdate").resolves(null);

      const req = { params: { id: "missing" } };
      const res = createMockRes();

      await photosController.trashPhoto(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "Photo not found" })).to.be.true;
    });
  });

  describe("restorePhoto", () => {
    it("sets flagUseStatus to true", async () => {
      const fakePhoto = { _id: "1", flagUseStatus: true };
      const updateStub = sinon
        .stub(Photo, "findByIdAndUpdate")
        .resolves(fakePhoto);

      const req = { params: { id: "1" } };
      const res = createMockRes();

      await photosController.restorePhoto(req, res);

      expect(
        updateStub.calledWith("1", { flagUseStatus: true }, { new: true }),
      ).to.be.true;
      expect(res.json.calledWith(fakePhoto)).to.be.true;
    });
  });

  describe("deletePhoto", () => {
    it("permanently deletes the photo", async () => {
      const deleteStub = sinon
        .stub(Photo, "findByIdAndDelete")
        .resolves({ _id: "1" });

      const req = { params: { id: "1" } };
      const res = createMockRes();

      await photosController.deletePhoto(req, res);

      expect(deleteStub.calledWith("1")).to.be.true;
      expect(res.json.calledWith({ success: true })).to.be.true;
    });

    it("responds with 404 when nothing was deleted", async () => {
      sinon.stub(Photo, "findByIdAndDelete").resolves(null);

      const req = { params: { id: "missing" } };
      const res = createMockRes();

      await photosController.deletePhoto(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  describe("addPhotoToAlbum", () => {
    it("responds with 404 when the album does not exist", async () => {
      sinon.stub(Album, "findById").resolves(null);

      const req = { params: { id: "p1" }, body: { albumId: "missing" } };
      const res = createMockRes();

      await photosController.addPhotoToAlbum(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "Album not found" })).to.be.true;
    });

    it("stamps the photo with the album id and name", async () => {
      sinon.stub(Album, "findById").resolves({ _id: "a1", name: "Nature" });
      const updateStub = sinon.stub(Photo, "findByIdAndUpdate").resolves({
        _id: "p1",
        album: "a1",
        albumName: "Nature",
      });

      const req = { params: { id: "p1" }, body: { albumId: "a1" } };
      const res = createMockRes();

      await photosController.addPhotoToAlbum(req, res);

      expect(
        updateStub.calledWith(
          "p1",
          { album: "a1", albumName: "Nature" },
          { new: true },
        ),
      ).to.be.true;
      expect(res.status.called).to.be.false;
    });

    it("responds with 404 when the photo does not exist", async () => {
      sinon.stub(Album, "findById").resolves({ _id: "a1", name: "Nature" });
      sinon.stub(Photo, "findByIdAndUpdate").resolves(null);

      const req = { params: { id: "missing" }, body: { albumId: "a1" } };
      const res = createMockRes();

      await photosController.addPhotoToAlbum(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: "Photo not found" })).to.be.true;
    });
  });
});
