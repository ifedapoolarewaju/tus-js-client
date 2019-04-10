"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileStorage = exports.canStoreURLs = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint no-unused-vars: 0 */


exports.getStorage = getStorage;

var _fs = require("fs");

var _properLockfile = require("proper-lockfile");

var lockfile = _interopRequireWildcard(_properLockfile);

var _path = require("path");

var path = _interopRequireWildcard(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var canStoreURLs = exports.canStoreURLs = true;
var defaultStoragePath = path.join(process.cwd(), "tus-url-storage.json");

var FileStorage = exports.FileStorage = function () {
  function FileStorage(filePath) {
    _classCallCheck(this, FileStorage);

    this.path = filePath || defaultStoragePath;
  }

  _createClass(FileStorage, [{
    key: "setItem",
    value: function setItem(key, value, cb) {
      var _this = this;

      lockfile.lock(this.path, this._lockfileOptions).then(function (release) {
        cb = _this._releaseAndCb(release, cb);
        _this._getData(function (err, data) {
          if (err) {
            return cb(err);
          }

          data[key] = value;
          _this._writeData(data, function (err) {
            return cb(err);
          });
        });
      }).catch(cb);
    }
  }, {
    key: "getItem",
    value: function getItem(key, cb) {
      this._getData(function (err, data) {
        if (err) {
          return cb(err);
        }
        cb(null, data[key]);
      });
    }
  }, {
    key: "removeItem",
    value: function removeItem(key, cb) {
      var _this2 = this;

      lockfile.lock(this.path, this._lockfileOptions).then(function (release) {
        cb = _this2._releaseAndCb(release, cb);
        _this2._getData(function (err, data) {
          if (err) {
            return cb(err);
          }

          delete data[key];
          _this2._writeData(data, function (err) {
            return cb(err);
          });
        });
      }).catch(cb);
    }
  }, {
    key: "_releaseAndCb",
    value: function _releaseAndCb(release, cb) {
      return function (err) {
        if (err) {
          // @TODO consider combining both errors in the catch clause
          release().then(function () {
            return cb(err);
          }).catch(function () {
            return cb(err);
          });
          return;
        }

        release().then(cb).catch(cb);
      };
    }
  }, {
    key: "_writeData",
    value: function _writeData(data, cb) {
      var opts = {
        encoding: "utf8",
        mode: 438,
        flag: "w"
      };
      (0, _fs.writeFile)(this.path, JSON.stringify(data), opts, function (err) {
        return cb(err);
      });
    }
  }, {
    key: "_getData",
    value: function _getData(cb) {
      (0, _fs.readFile)(this.path, "utf8", function (err, data) {
        if (err) {
          // return empty data if file does not exist
          err.code === "ENOENT" ? cb(null, {}) : cb(err);
          return;
        } else {
          data = !data.trim().length ? {} : JSON.parse(data);
          cb(null, data);
        }
      });
    }
  }, {
    key: "_lockfileOptions",
    get: function get() {
      return {
        realpath: false,
        retries: {
          retries: 5,
          minTimeout: 20
        }
      };
    }
  }]);

  return FileStorage;
}();

function getStorage() {
  return new FileStorage();
}