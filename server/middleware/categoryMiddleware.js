const featureToggle = (req, res, next) => {
    if (req.body.featureToggle !== undefined) {
        req.body.featureToggle = Boolean(req.body.featureToggle);
    }
    next();
};

export default featureToggle;
