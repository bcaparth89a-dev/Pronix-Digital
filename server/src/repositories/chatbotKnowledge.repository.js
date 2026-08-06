import { ChatbotKnowledge } from "../models/ChatbotKnowledge.model.js";
import { BaseRepository } from "./base.repository.js";

class ChatbotKnowledgeRepository extends BaseRepository {
  constructor() {
    super(ChatbotKnowledge);
  }
}

export const chatbotKnowledgeRepository = new ChatbotKnowledgeRepository();

