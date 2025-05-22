const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            status: 'ERR',
            message: 'Invalid token or no token provided'
        });
    }

    return res.status(500).json({
        status: 'ERR',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

module.exports = errorHandler; 