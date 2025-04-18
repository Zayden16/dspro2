import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : (() => {
      // Create a custom Anthropic provider if MCP_BASE_URL is specified
      const anthropicProvider = process.env.MCP_BASE_URL
        ? createAnthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
            baseURL: process.env.MCP_BASE_URL,
          })
        : anthropic;
        
      return customProvider({
      languageModels: {
        'chat-model': anthropicProvider('claude-3-haiku-20240307', {
          sendReasoning: true,
        }),
        'chat-model-reasoning': wrapLanguageModel({
          model: anthropicProvider('claude-3-haiku-20240307', {
            sendReasoning: true,
          }),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': anthropicProvider('claude-3-haiku-20240307', {
          sendReasoning: true,
        }),
        'artifact-model': anthropicProvider('claude-3-haiku-20240307', {
          sendReasoning: true,
        }),
      },
    });
    })();
