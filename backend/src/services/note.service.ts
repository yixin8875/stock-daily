import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface NoteInput {
  title: string
  content: string
  category: string
  tags?: string[]
}

export const noteService = {
  async getNotes(userId: string, category?: string) {
    return prisma.learningNote.findMany({
      where: { userId, ...(category && { category }) },
      orderBy: { createdAt: 'desc' },
    })
  },

  async createNote(userId: string, data: NoteInput) {
    return prisma.learningNote.create({
      data: { userId, ...data },
    })
  },

  async updateNote(userId: string, id: string, data: Partial<NoteInput>) {
    return prisma.learningNote.update({
      where: { id, userId },
      data,
    })
  },

  async deleteNote(userId: string, id: string) {
    return prisma.learningNote.delete({
      where: { id, userId },
    })
  },
}
