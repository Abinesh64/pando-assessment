const { expect } = require("chai");
const sinon = require("sinon");

const Album = require("../src/models/albums.model.js");
const Photo = require("../src/models/photos.model.js");
const albumsController = require("../src/controllers/albums.controller.js");
const { createMockRes } = require("./helpers/mockRes.js");

describe("albums.controller", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("getAlbums", () => {
    it("attaches a cover photo to each album", async () => {
      const albumDocs = [
        {
          _id: "a1",
          name: "Nature",
          toObject: () => ({ _id: "a1", name: "Nature" }),
        },
        {
          _id: "a2",
          name: "Empty",
          toObject: () => ({ _id: "a2", name: "Empty" }),
        },
      ];
      const sortStub = sinon.stub().resolves(albumDocs);
      sinon.stub(Album, "find").returns({ sort: sortStub });

      const findOneStub = sinon.stub(Photo, "findOne");
      findOneStub
        .withArgs({ album: "a1", flagUseStatus: true })
        .resolves({ url: "cover.jpg" });
      findOneStub
        .withArgs({ album: "a2", flagUseStatus: true })
        .resolves(null);

      const req = { query: {} };
      const res = createMockRes();

      await albumsController.getAlbums(req, res);

      const result = res.json.firstCall.args[0];
      expect(result[0]).to.deep.equal({
        _id: "a1",
        name: "Nature",
        coverUrl: "cover.jpg",
      });
      expect(result[1]).to.deep.equal({
        _id: "a2",
        name: "Empty",
        coverUrl: null,
      });
    });

    it("responds with 500 on failure", async () => {
      sinon.stub(Album, "find").throws(new Error("boom"));

      const req = { query: {} };
      const res = createMockRes();

      await albumsController.getAlbums(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: "boom" })).to.be.true;
    });
  });

  describe("createAlbum", () => {
    it("creates an album with the given name", async () => {
      // mock: pin down the exact shape Album.create is called with
      const mock = sinon.mock(Album);
      mock
        .expects("create")
        .once()
        .withArgs(sinon.match({ name: "Trip" }))
        .resolves({ _id: "a1", name: "Trip" });

      const req = { body: { name: "Trip" } };
      const res = createMockRes();

      await albumsController.createAlbum(req, res);

      mock.verify();
      mock.restore();
      expect(res.status.calledWith(200)).to.be.true;
      expect(
        res.json.calledWith({
          success: true,
          data: { _id: "a1", name: "Trip" },
        }),
      ).to.be.true;
    });

    it("responds with 500 when creation fails", async () => {
      sinon.stub(Album, "create").rejects(new Error("validation failed"));

      const req = { body: { name: "" } };
      const res = createMockRes();

      await albumsController.createAlbum(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe("getAlbumPhotos", () => {
    it("filters by album id and active status, applying pagination", async () => {
      const fakePhotos = [{ name: "one.jpg" }];
      const fakeQuery = {
        sort: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        skip: sinon.stub().returns(fakePhotos),
      };
      const findStub = sinon.stub(Photo, "find").returns(fakeQuery);

      const req = { params: { id: "a1" }, query: { page: 2, limit: 5 } };
      const res = createMockRes();

      await albumsController.getAlbumPhotos(req, res);

      expect(
        findStub.calledWith({ album: "a1", flagUseStatus: true }),
      ).to.be.true;
      expect(fakeQuery.limit.calledWith(5)).to.be.true;
      expect(fakeQuery.skip.calledWith(5)).to.be.true; // (page 2 - 1) * limit 5
      expect(res.json.calledWith(fakePhotos)).to.be.true;
    });

    it("responds with 500 when the database call throws", async () => {
      sinon.stub(Photo, "find").throws(new Error("db down"));

      const req = { params: { id: "a1" }, query: {} };
      const res = createMockRes();

      await albumsController.getAlbumPhotos(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
