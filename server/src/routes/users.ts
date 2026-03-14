import { Router } from 'express'
import { listUsers, createUser, getUser, updateUser, deleteUser } from '../controllers/usersController'
import { requireAdmin, requireAuth } from '../middleware/auth'

const router = Router()

router.use(requireAuth)

router.get('/', requireAdmin, listUsers)
router.post('/', requireAdmin, createUser)
router.get('/:id', getUser)
router.put('/:id', updateUser)
router.delete('/:id', requireAdmin, deleteUser)

export default router
