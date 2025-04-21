import TelegramBot from 'node-telegram-bot-api';
import type { ISignal } from '../models/signal.model';
import { formatIndianDate, formatTime } from '../utils/date.util';

let botInstance: TelegramBot | null = null;
let channelId: string | null = null;

/**
 * Initialize the Telegram bot
 */
export const initializeTelegramBot = async () => {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    channelId = process.env.TELEGRAM_CHANNEL_ID;

    if (!token) {
      console.warn('Telegram Bot Token not found. Telegram service not initialized.');
      return;
    }

    if (!channelId) {
      console.warn('Telegram Channel ID not found. Messages will not be sent.');
    }

    // Create a bot that uses 'polling' to fetch new updates
    botInstance = new TelegramBot(token, { polling: true });

    console.log('Telegram Bot initialized successfully.');

    // Listen for messages
    botInstance.on('message', handleMessage);

    // Send a startup message to the channel
    await sendMessage('🚀 Trading Signal System started. Ready to generate signals.');
  } catch (error) {
    console.error('Error initializing Telegram bot:', error);
  }
};

/**
 * Handle incoming messages to the bot
 */
const handleMessage = async (msg: any) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log(`Message from ${chatId}: ${text}`);

  // If the message is from the channel/group, store the ID
  if (msg.chat.type === 'group' || msg.chat.type === 'supergroup' || msg.chat.type === 'channel') {
    if (!channelId) {
      channelId = chatId.toString();
      console.log(`Channel ID set to: ${channelId}`);
      await botInstance?.sendMessage(chatId, 'This channel is now set as the signal notification channel.');
    }
  }

  // Command processing
  if (text.startsWith('/')) {
    const args = text.split(' ');
    const command = args[0].toLowerCase();

    switch (command) {
      case '/start':
        await botInstance?.sendMessage(chatId, 'Welcome to Trading Signal System Bot! 📈\nI will send you trade signals when they are generated.');
        break;

      case '/help':
        await botInstance?.sendMessage(chatId, 'Trading Signal System Bot Help:\n\n/start - Start the bot\n/status - Check system status\n/signals - Get recent signals');
        break;

      case '/status':
        await botInstance?.sendMessage(chatId, '✅ Trading Signal System is running\n\nReady to generate and send signals.');
        break;

      case '/signals':
        await botInstance?.sendMessage(chatId, 'Recent signals feature coming soon...');
        break;

      default:
        await botInstance?.sendMessage(chatId, 'Unknown command. Type /help for available commands.');
        break;
    }
  }
};

/**
 * Send a text message to the channel
 */
export const sendMessage = async (message: string): Promise<boolean> => {
  try {
    if (!botInstance || !channelId) {
      console.warn('Telegram bot or channel ID not set. Message not sent.');
      return false;
    }

    await botInstance.sendMessage(channelId, message, { parse_mode: 'HTML' });
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
};

/**
 * Send a signal to the channel
 */
export const sendSignal = async (signal: ISignal): Promise<boolean> => {
  try {
    if (!botInstance || !channelId) {
      console.warn('Telegram bot or channel ID not set. Signal not sent.');
      return false;
    }

    const date = formatIndianDate(signal.generatedAt);
    const time = formatTime(signal.generatedAt);

    // Create formatted message
    let message = `<b>🚨 NEW ${signal.type} SIGNAL</b>\n\n`;
    message += `<b>Stock:</b> ${signal.stock}\n`;
    message += `<b>Option:</b> ${signal.option}\n`;
    message += `<b>CMP:</b> ₹${signal.currentMarketPrice.toFixed(2)}\n`;
    message += `<b>Buy Above:</b> ₹${signal.entryPrice.toFixed(2)}\n`;
    message += `<b>Target:</b> ₹${signal.targetPrice.toFixed(2)}\n`;
    message += `<b>SL:</b> ₹${signal.stopLoss.toFixed(2)}\n`;
    message += `<b>R:R =</b> ${signal.riskRewardRatio}\n`;
    message += `<b>Signal Time:</b> ${date} ${time}\n\n`;

    // Include technical indicators if available
    if (signal.indicators) {
      message += '<b>Indicators:</b>\n';

      if (signal.indicators.rsi !== undefined) {
        message += `RSI: ${signal.indicators.rsi.toFixed(2)}\n`;
      }

      if (signal.indicators.macd) {
        message += `MACD Line: ${signal.indicators.macd.line.toFixed(2)}\n`;
      }

      if (signal.indicators.supertrend !== undefined) {
        message += `SuperTrend: ${signal.indicators.supertrend ? 'Bullish' : 'Bearish'}\n`;
      }

      if (signal.indicators.priceAboveVwap !== undefined) {
        message += `Price vs VWAP: ${signal.indicators.priceAboveVwap ? 'Above' : 'Below'}\n`;
      }
    }

    // Add disclaimer
    message += '\n<i>Trade at your own risk. Always use proper risk management.</i>';

    // Send message
    await botInstance.sendMessage(channelId, message, { parse_mode: 'HTML' });

    // Update signal as sent
    signal.sentToTelegram = true;
    signal.sentAt = new Date();
    await signal.save();

    return true;
  } catch (error) {
    console.error('Error sending signal to Telegram:', error);
    return false;
  }
};

/**
 * Send an order execution update to the channel
 */
export const sendOrderUpdate = async (signal: ISignal, isExecuted: boolean, message: string): Promise<boolean> => {
  try {
    if (!botInstance || !channelId) {
      console.warn('Telegram bot or channel ID not set. Order update not sent.');
      return false;
    }

    let updateMessage = `<b>📊 ORDER UPDATE</b>\n\n`;
    updateMessage += `<b>Stock:</b> ${signal.stock}\n`;
    updateMessage += `<b>Option:</b> ${signal.option}\n`;
    updateMessage += `<b>Signal Type:</b> ${signal.type}\n`;
    updateMessage += `<b>Status:</b> ${isExecuted ? '✅ EXECUTED' : '❌ FAILED'}\n\n`;
    updateMessage += message;

    // Send message
    await botInstance.sendMessage(channelId, updateMessage, { parse_mode: 'HTML' });

    return true;
  } catch (error) {
    console.error('Error sending order update to Telegram:', error);
    return false;
  }
};

/**
 * Send a profit/loss update to the channel
 */
export const sendPnLUpdate = async (signal: ISignal, exitReason: string): Promise<boolean> => {
  try {
    if (!botInstance || !channelId) {
      console.warn('Telegram bot or channel ID not set. P&L update not sent.');
      return false;
    }

    const profitLoss = signal.profitLoss || 0;
    const isProfit = profitLoss > 0;

    const pnlEmoji = isProfit ? '💰' : '📉';

    let message = `<b>${pnlEmoji} TRADE COMPLETED</b>\n\n`;
    message += `<b>Stock:</b> ${signal.stock}\n`;
    message += `<b>Option:</b> ${signal.option}\n`;
    message += `<b>Signal Type:</b> ${signal.type}\n`;
    message += `<b>Entry Price:</b> ₹${signal.entryPrice.toFixed(2)}\n`;
    message += `<b>Exit Price:</b> ₹${signal.exitPrice?.toFixed(2) || 'N/A'}\n`;
    message += `<b>P&L:</b> ${isProfit ? '+' : ''}₹${Math.abs(profitLoss).toFixed(2)}\n`;
    message += `<b>Exit Reason:</b> ${exitReason}\n`;

    // Calculate trade duration if available
    if (signal.executedAt && signal.exitAt) {
      const durationMs = signal.exitAt.getTime() - signal.executedAt.getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      const durationHours = Math.floor(durationMinutes / 60);
      const remainingMinutes = durationMinutes % 60;

      let durationText = '';
      if (durationHours > 0) {
        durationText += `${durationHours}h `;
      }
      durationText += `${remainingMinutes}m`;

      message += `<b>Trade Duration:</b> ${durationText}\n`;
    }

    // Send message
    await botInstance.sendMessage(channelId, message, { parse_mode: 'HTML' });

    return true;
  } catch (error) {
    console.error('Error sending P&L update to Telegram:', error);
    return false;
  }
};

/**
 * Send a system alert to the channel
 */
export const sendSystemAlert = async (alertType: 'info' | 'warning' | 'error', message: string): Promise<boolean> => {
  try {
    if (!botInstance || !channelId) {
      console.warn('Telegram bot or channel ID not set. System alert not sent.');
      return false;
    }

    let emoji = '📝';
    let title = 'SYSTEM INFO';

    if (alertType === 'warning') {
      emoji = '⚠️';
      title = 'SYSTEM WARNING';
    } else if (alertType === 'error') {
      emoji = '🔴';
      title = 'SYSTEM ERROR';
    }

    const alertMessage = `<b>${emoji} ${title}</b>\n\n${message}`;

    // Send message
    await botInstance.sendMessage(channelId, alertMessage, { parse_mode: 'HTML' });

    return true;
  } catch (error) {
    console.error('Error sending system alert to Telegram:', error);
    return false;
  }
};

/**
 * Get Telegram bot status
 */
export const getTelegramStatus = () => {
  return {
    isInitialized: !!botInstance,
    hasChannelId: !!channelId,
    channelId: channelId ? channelId : undefined,
  };
};
