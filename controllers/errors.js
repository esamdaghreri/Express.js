module.exports.get404 = (req, res, next) => {
    res.render('404', {pageTitle: 'Page not found 404', path: '/404', isAuthenticated: req.session.isLoggedIn});
}

module.exports.get500 = (req, res, next) => {
    res.render('500', {pageTitle: 'Error', path: '/500', isAuthenticated: req.session.isLoggedIn});
}