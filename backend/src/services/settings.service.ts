import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SettingsInput {
  dashboardLayout?: object
  screenFilters?: object
  compareStocks?: string[]
  gridCalculator?: object
  dipCalculator?: object
}

export const settingsService = {
  async getSettings(userId: string) {
    return prisma.userSettings.findUnique({
      where: { userId },
    })
  },

  async updateSettings(userId: string, data: SettingsInput) {
    return prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    })
  },
}
