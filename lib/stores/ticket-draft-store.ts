import { create } from "zustand"
import { persist } from "zustand/middleware"

export type TicketDraftStatus = "draft" | "reviewing" | "pending_confirm" | "archived"

export interface TicketDraftAttachment {
  id: string
  fileName: string
  contentType?: string
  fileSize?: number
}

export interface TicketDraft {
  id: string
  emailId: string
  emailSubject?: string
  createdAt: string
  updatedAt: string
  extractedData: Record<string, string>
  extractedText?: string
  attachments: TicketDraftAttachment[]
  status: TicketDraftStatus
  aiSummary?: string | null
  notes?: string
}

interface TicketDraftState {
  drafts: TicketDraft[]
  createDraft: (draft: Omit<TicketDraft, "id" | "createdAt" | "updatedAt">) => string
  updateDraft: (id: string, patch: Partial<Omit<TicketDraft, "id" | "createdAt">>) => void
  deleteDraft: (id: string) => void
  getByEmailId: (emailId: string) => TicketDraft[]
  getById: (id: string) => TicketDraft | undefined
  searchDrafts: (query: string) => TicketDraft[]
}

export const useTicketDraftStore = create<TicketDraftState>()(
  persist(
    (set, get) => ({
      drafts: [],

      createDraft: (draft) => {
        const id = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const now = new Date().toISOString()
        const newDraft: TicketDraft = {
          ...draft,
          id,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ drafts: [newDraft, ...state.drafts] }))
        return id
      },

      updateDraft: (id, patch) => {
        set((state) => ({
          drafts: state.drafts.map((d) =>
            d.id === id
              ? { ...d, ...patch, updatedAt: new Date().toISOString() }
              : d
          ),
        }))
      },

      deleteDraft: (id) => {
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== id),
        }))
      },

      getByEmailId: (emailId) => {
        return get().drafts
          .filter((d) => d.emailId === emailId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      getById: (id) => {
        return get().drafts.find((d) => d.id === id)
      },

      searchDrafts: (query) => {
        const q = query.trim().toLowerCase()
        if (!q) return get().drafts
        return get().drafts.filter((d) => {
          const text = [
            d.emailSubject,
            d.aiSummary,
            d.notes,
            d.extractedText,
            ...Object.values(d.extractedData),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
          return text.includes(q)
        })
      },
    }),
    {
      name: "ticket-draft-storage",
    }
  )
)
