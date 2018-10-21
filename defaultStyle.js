const style = {
    head: "\\documentclass[12pt]{article}" +
        "\\usepackage{amsmath}" +
        "\\usepackage{enumerate}" +
        "\\usepackage{enumitem}" +
        "\\begin{document}",
    tail: "\\end{document}",
    prefix: " ",
    postfix: "\\\\ ",
    alignPrefix: "\\begin{align*}",
    alignSuffix: "\\end{align*}",
    bulletPrefix: "\\begin{itemize}[leftmargin=2.0cm]\n",
    bulletItem: "\\item[%%] ",
    bulletSuffix: "\\end{itemize}"
};

module.exports = style;