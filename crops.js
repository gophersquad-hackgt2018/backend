const cv = require('opencv4nodejs')

// Read image and search for contours
// const img = cv.imread('./pic2.jpg')
// const img2 = cv.imread('./pic2.jpg')

function getCrops(filename) {
  const img = cv.imread(`./scans/${filename}`)
  const gray = img.cvtColor(cv.COLOR_BGR2GRAY)
  let threshold = gray.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY, 51, 20)
  cv.imshow('a window name', gray.resize(0, 0, 0.3, 0.3))
  cv.waitKey()
  cv.imshow('a window name', threshold.resize(0, 0, 0.3, 0.3))
  cv.waitKey()
  let contours = threshold.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_NONE)

  // Create first mask for rotation
  let mask = new cv.Mat(img.rows, img.cols, cv.CV_8U, 255)

  // Draw contours on the mask with size and ratio of borders for threshold
  contours.forEach((cnt) => {
    let size = cnt.area
    let x = cnt.boundingRect().x
    let y = cnt.boundingRect().y
    let w = cnt.boundingRect().width
    let h = cnt.boundingRect().height
    if (size > 10000) {
      console.log(size)
    }
    if (10000 > size && size > 50 && w * 2.5 > h) {
      // console.log(cnt)
      mask.drawContours([cnt], new cv.Vec3(0, 0, 0), -1, cv.LINE_8, -1)
    }
  })

  // Connect neighbour contours and select the biggest one (text).
  let kernel = new cv.Mat(70, 250, cv.CV_8U, 1)
  let gray_op = mask.morphologyEx(kernel, cv.MORPH_OPEN)
  let threshold_op = gray_op.threshold(170, 255, cv.THRESH_BINARY_INV)

  // Remove holes
  let floodfill = threshold_op.copy()
  let floodMask = new cv.Mat(threshold_op.sizes[0], threshold_op.sizes[1],
      cv.CV_8U, 0)
  floodfill.floodFill(new cv.Point2(0, 0), 255)
  let floodfillInv = floodfill.bitwiseNot()
  let out = threshold_op.bitwiseOr(floodfillInv)
  let contours_op = out.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_NONE)

  // cv.imshow('a window name', mask.resize(0, 0, 0.3, 0.3))
  // cv.waitKey()
  // cv.imshow('a window name', gray_op.resize(0, 0, 0.3, 0.3))
  // cv.waitKey()
  // cv.imshow('a window name', threshold_op.resize(0, 0, 0.3, 0.3))
  // cv.waitKey()
  // cv.imshow('a window name', out.resize(0, 0, 0.3, 0.3))
  // cv.waitKey()

  contours_op.sort((a, b) => {
    return a.area - b.area
  })

  let outNames = []
  contours_op.forEach((cont, ind) => {
    // gray.drawRectangle(cont.boundingRect(), new cv.Vec3(0,0,255), 3)
    // cv.imshow('a window name', gray.getRegion(cont.boundingRect()))
    // cv.waitKey()
    cv.imwrite(`./crops/${filename}-${ind}.jpg`, gray.getRegion(cont.boundingRect()))
    outNames.push(`${filename}-${ind}.jpg`)
    //  Replace region with white so we don't do things twice
    gray.drawRectangle(cont.boundingRect(), new cv.Vec3(255, 255, 255), -1)
  })
  return outNames
  // cv.imshow('a window name', gray.resize(0, 0, 0.3, 0.3))
  // cv.waitKey()
}

module.exports = getCrops;