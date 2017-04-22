import { Router } from 'express';

const router = Router();

router.get('/api/logout', function _logout(req, res) {
    req.session.destroy(function destroyError(error) {
        res.send(500, `There was an error destroying the session: ${error}`)
        return;
    });
    res.send(200, "Session destroyed");
    return;
})
