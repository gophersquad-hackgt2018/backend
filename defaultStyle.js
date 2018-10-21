const style = {
  head: "\\documentclass[12pt]{article}" +
      "\\usepackage{amsmath}" +
      "\\begin{document}" +
      "\\begin{align*}",
  tail: "\\end{align*}" +
      "\\end{document}",
  prefix: " ",
  postfix: "\\\\ "
}

module.exports = style;