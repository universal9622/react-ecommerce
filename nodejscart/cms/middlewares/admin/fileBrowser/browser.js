const {CONSTANTS} = require('../../../../../lib/util');
const { join } = require('path');
const { existsSync, readdirSync } = require('fs');

module.exports = (request, response) => {
    let path = request.params[0] || "";
    if(!existsSync(join(CONSTANTS.MEDIAPATH, path))) {
        response.json({
            success: false,
            message: "Requested path does not exist"
        });
    } else {
        response.json({
            success: true,
            data: {
                folders: readdirSync(join(CONSTANTS.MEDIAPATH, path), { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name),
                files: readdirSync(join(CONSTANTS.MEDIAPATH, path), { withFileTypes: true })
                    .filter(dirent => dirent.isFile())
                    .map(f => {
                        return {
                            url: `/media/${path}/${f.name}`,
                            name: f.name
                        };
                    })
            }
        });
    }

    return "STOP";
}