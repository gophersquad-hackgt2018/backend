const cv = require("opencv4nodejs");

// Read image and search for contours
// const img = cv.imread('./pic2.jpg')
// const img2 = cv.imread('./pic2.jpg')

function getCrops(filename) {
    const inp = cv.imread(`./uploads/${filename}`);
    // const borderWidth = Math.floor(inp.sizes[0]*0.1)
    // const img = inp.copyMakeBorder(borderWidth, borderWidth, borderWidth, borderWidth, cv.BORDER_CONSTANT, new cv.Vec3(255,255,255))
    const img = inp;
    const gray = img.cvtColor(cv.COLOR_BGR2GRAY);
    let threshold = gray.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY, 151, 25);
    let blurred = threshold.gaussianBlur(new cv.Size(31, 31), 51, 3);
    blurred = blurred.medianBlur(11);
    let thresh2 = blurred.threshold(240, 255, cv.THRESH_BINARY);
    // blurred = threshold.gaussianBlur(new cv.Size(101, 101), 51, 7)
    // thresh2 = blurred.threshold(235, 255, cv.THRESH_BINARY)
    // blurred = threshold.gaussianBlur(new cv.Size(101, 101), 51, 7)
    // thresh2 = blurred.threshold(235, 255, cv.THRESH_BINARY)
    // cv.imshow('a window name', gray.resize(0, 0, 0.4, 0.4))
    // cv.waitKey()
    // cv.imshow('a window name', threshold.resize(0, 0, 0.4, 0.4))
    // cv.waitKey()
    // cv.imshow('a window name', blurred.resize(0, 0, 0.4, 0.4))
    // cv.waitKey()
    let contours = thresh2.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_NONE);
    // Create first mask for rotation
    let mask = new cv.Mat(img.rows, img.cols, cv.CV_8U, 255);

    // Draw contours on the mask with size and ratio of borders for threshold
    contours.forEach((cnt) => {
        let size = cnt.area;
        let x = cnt.boundingRect().x;
        let y = cnt.boundingRect().y;
        let w = cnt.boundingRect().width;
        let h = cnt.boundingRect().height;
        if (img.cols * img.rows / 2 > size && size > 35 && w * 2.5 > h && h >
            img.cols * 0.01) {
            // console.log(cnt)
            mask.drawContours([cnt], new cv.Vec3(0, 0, 0), -1, cv.LINE_8, -1);
        }
    });

    // Connect neighbour contours and select the biggest one (text).
    let kernel = new cv.Mat(11, 100, cv.CV_8U, 1);
    let gray_op = mask.morphologyEx(kernel, cv.MORPH_OPEN);
    let threshold_op = gray_op.threshold(170, 255, cv.THRESH_BINARY_INV);

    // Remove holes
    let floodfill = threshold_op.copy();
    let floodMask = new cv.Mat(
        threshold_op.sizes[0],
        threshold_op.sizes[1],
        cv.CV_8U,
        0,
    );
    floodfill.floodFill(new cv.Point2(0, 0), 255);
    let floodfillInv = floodfill.bitwiseNot();
    let out = threshold_op.bitwiseOr(floodfillInv);
    let contours_op = out.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_NONE);

    // cv.imshow('a window name', mask.resize(0, 0, 0.4, 0.4))
    // cv.waitKey()
    // cv.imshow('a window name', gray_op.resize(0, 0, 0.4, 0.4))
    // cv.waitKey()
    // cv.imshow('a window name', threshold_op.resize(0, 0, 0.4, 0.4))
    // cv.waitKey()
    // cv.imshow('a window name', out.resize(0, 0, 0.4, 0.4))
    // cv.waitKey()

    contours_op = contours_op.filter(cnt => {
        return img.cols * img.rows / 2 > cnt.area && cnt.area > 10;
    })

    contours_op.sort((a, b) => {
        return a.boundingRect().y - b.boundingRect().y;
    });

    let names = [];
    contours_op.forEach((cont, ind) => {
        gray.drawRectangle(cont.boundingRect(), new cv.Vec3(0, 0, 255), 3);
        // cv.imshow('a window name', threshold.getRegion(cont.boundingRect()))
        // cv.waitKey()
        cv.imwrite(`./crops/${filename}-${ind}.jpg`,
            threshold.getRegion(cont.boundingRect()));
        // out.push(gray.getRegion(cont.boundingRect()).getData())
        names.push(`${filename}-${ind}.jpg`);
        //  Replace region with white so we don't do things twice
        gray.drawRectangle(cont.boundingRect(), new cv.Vec3(255, 255, 255), -1);
    });
    // cv.imshow('a window name', gray.resize(0, 0, 0.4, 0.4))
    // cv.waitKey()
    // console.log(names);
    return names;
}

// function fourCornerSort(points) {
//   dif = []
//   sum = []
//   points.forEach(pnt => {
//     dif.push(pnt[0]-pnt[1])
//     sum.push(pnt[0]+pnt[1])
//   })
//   let tl = points[points.indexOf(Math.min(...sum))]
//   let bl = points[points.indexOf(Math.max(...dif))]
//   let br = points[points.indexOf(Math.max(...sum))]
//   let tr = points[points.indexOf(Math.min(...dif))]
//   return [tl, bl, br, tr]
// }
//
// function contourOffset(cnt, offset) {
//   cnt.getPoints()
// }

// getCrops("../clean3.jpg")

module.exports = {
    getCrops: getCrops,
};
