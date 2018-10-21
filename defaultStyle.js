const style = {
    head: "\\documentclass[12pt]{article}" +
        "\\usepackage{amsmath}" +
        "\\usepackage{enumerate}" +
        "\\begin{document}" +
        "\\begin{align*}",
    tail: "\\end{align*}" +
        "\\end{document}",
    prefix: " ",
    postfix: "\\\\ ",
    bulletPrefix: "\\begin{itemize}[leftmargin=2.0cm,labelsep=0.5cm]\n" +
        "\\item[%%] ",
    bulletSuffix: "\\end{itemize}"
};

module.exports = style;