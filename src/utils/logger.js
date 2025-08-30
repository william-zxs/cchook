import chalk from 'chalk';
import figures from 'figures';

export class Logger {
  static info(message, ...args) {
    console.log(chalk.blue(figures.info), message, ...args);
  }

  static success(message, ...args) {
    console.log(chalk.green(figures.tick), message, ...args);
  }

  static warning(message, ...args) {
    console.log(chalk.yellow(figures.warning), message, ...args);
  }

  static error(message, ...args) {
    console.log(chalk.red(figures.cross), message, ...args);
  }

  static debug(message, ...args) {
    if (process.env.DEBUG) {
      console.log(chalk.gray(figures.bullet), chalk.gray(message), ...args);
    }
  }

  static plain(message, ...args) {
    console.log(message, ...args);
  }
}