const enableToggleMiddleware = (req, res, next) => {
    if (req.body.enableToggle !== undefined) {
        req.body.enableToggle = Boolean(req.body.enableToggle);
    }
    next();
};

export default enableToggleMiddleware;
