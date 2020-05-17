import express from 'express'
const router = express.Router()


import {getLibros} from '../controllers/ControllerLibro'
import {getPeelr} from '../controllers/peerlController'
import {getNotebooksCg} from '../controllers/NoteBooksCG'

router.get('/api/books',getLibros)
router.get('/api/peelr',getPeelr)
router.get('/api/NotebooksCG',getNotebooksCg)


module.exports = router; 