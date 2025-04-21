import * as SignalGenerator from './signalGenerator.service';
import * as OrderExecution from './orderExecution.service';
import * as KiteService from './kite.service';
import * as TelegramService from './telegram.service';
import { isMarketHours, isMarketOpeningTime, isMarketClosingTime } from '../utils/date.util';

let signalGeneratorInterval: NodeJS.Timeout | null = null;
let orderExecutionInterval: NodeJS.Timeout | null = null;
let orderCheckInterval: NodeJS.Timeout | null = null;
let marketStatusCheckInterval: NodeJS.Timeout | null = null;

/**
 * Initialize all schedulers
 */
export const initializeSchedulers = () => {
  console.log('Initializing schedulers...');

  // Run market status check every 5 minutes
  marketStatusCheckInterval = setInterval(marketStatusCheck, 5 * 60 * 1000);

  // Initial check
  marketStatusCheck();

  console.log('Schedulers initialized successfully.');
};

/**
 * Check market status and start/stop appropriate schedulers
 */
const marketStatusCheck = async () => {
  try {
    if (isMarketHours()) {
      console.log('Market is open. Starting schedulers...');

      // Start signal generator scheduler if not running
      if (!signalGeneratorInterval) {
        console.log('Starting signal generator scheduler.');
        // Run signal generator every 5 minutes
        signalGeneratorInterval = setInterval(
          SignalGenerator.generateSignals,
          5 * 60 * 1000 // 5 minutes
        );

        // Run initial signal generation
        await SignalGenerator.generateSignals();
      }

      // Start order execution scheduler if not running
      if (!orderExecutionInterval) {
        console.log('Starting order execution scheduler.');
        // Run order execution every 2 minutes
        orderExecutionInterval = setInterval(
          OrderExecution.processPendingSignals,
          2 * 60 * 1000 // 2 minutes
        );

        // Run initial order execution
        await OrderExecution.processPendingSignals();
      }

      // Start order check scheduler if not running
      if (!orderCheckInterval) {
        console.log('Starting order check scheduler.');
        // Check orders every 1 minute
        orderCheckInterval = setInterval(
          OrderExecution.checkCompletedOrders,
          1 * 60 * 1000 // 1 minute
        );

        // Run initial order check
        await OrderExecution.checkCompletedOrders();
      }

      // If it's market opening time, send a notification
      if (isMarketOpeningTime()) {
        await TelegramService.sendSystemAlert(
          'info',
          'Market is now open. Trading system is active and monitoring for opportunities.'
        );
      }

      // If it's market closing time, send a notification
      if (isMarketClosingTime()) {
        await TelegramService.sendSystemAlert(
          'info',
          'Market is closing soon. No new signals will be generated.'
        );
      }
    } else {
      console.log('Market is closed. Stopping schedulers...');

      // Stop signal generator scheduler
      if (signalGeneratorInterval) {
        clearInterval(signalGeneratorInterval);
        signalGeneratorInterval = null;
        console.log('Signal generator scheduler stopped.');
      }

      // Stop order execution scheduler
      if (orderExecutionInterval) {
        clearInterval(orderExecutionInterval);
        orderExecutionInterval = null;
        console.log('Order execution scheduler stopped.');
      }

      // Stop order check scheduler
      if (orderCheckInterval) {
        clearInterval(orderCheckInterval);
        orderCheckInterval = null;
        console.log('Order check scheduler stopped.');
      }
    }
  } catch (error) {
    console.error('Error in market status check:', error);
  }
};

/**
 * Stop all schedulers
 */
export const stopAllSchedulers = () => {
  console.log('Stopping all schedulers...');

  if (signalGeneratorInterval) {
    clearInterval(signalGeneratorInterval);
    signalGeneratorInterval = null;
  }

  if (orderExecutionInterval) {
    clearInterval(orderExecutionInterval);
    orderExecutionInterval = null;
  }

  if (orderCheckInterval) {
    clearInterval(orderCheckInterval);
    orderCheckInterval = null;
  }

  if (marketStatusCheckInterval) {
    clearInterval(marketStatusCheckInterval);
    marketStatusCheckInterval = null;
  }

  console.log('All schedulers stopped successfully.');
};

/**
 * Run token refresh job at the start of each day
 */
export const scheduleTokenRefresh = () => {
  // Calculate time to next 8:45 AM
  const now = new Date();
  const nextRefresh = new Date(now);
  nextRefresh.setHours(8, 45, 0, 0);

  // If it's past 8:45 AM, schedule for tomorrow
  if (now.getTime() > nextRefresh.getTime()) {
    nextRefresh.setDate(nextRefresh.getDate() + 1);
  }

  const timeToRefresh = nextRefresh.getTime() - now.getTime();

  console.log(`Scheduling token refresh for ${nextRefresh.toLocaleString()}`);

  // Schedule token refresh
  setTimeout(() => {
    refreshKiteToken();

    // Schedule next token refresh
    scheduleTokenRefresh();
  }, timeToRefresh);
};

/**
 * Refresh Kite token
 */
const refreshKiteToken = async () => {
  try {
    console.log('Attempting to refresh Kite token...');

    // For now, this is a placeholder
    // In a real implementation, this would use the KiteService to refresh the token

    // Send notification
    await TelegramService.sendSystemAlert(
      'info',
      'Daily token refresh attempted. Please check system logs for status.'
    );
  } catch (error) {
    console.error('Error refreshing Kite token:', error);

    // Send error notification
    await TelegramService.sendSystemAlert(
      'error',
      'Failed to refresh Kite token. Manual intervention required.'
    );
  }
};
