const azure = require("azure-storage");
const blobService = azure.createBlobService();
const path = require("path");

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

const uploadLocalFile = async filePath => {
    return new Promise((resolve, reject) => {
        const fullPath = path.resolve(filePath);
        const blobName = path.basename(filePath);
        blobService.createBlockBlobFromLocalFile(
            containerName,
            blobName,
            fullPath,
            (err, result, resp) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(blobService.getUrl(containerName, blobName));
                }
            }
        );
    });
};

exports.uploadFile = uploadLocalFile;
