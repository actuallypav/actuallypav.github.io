export const description = `clear: clear\n
    Clear the terminal screen.\n
    Clears the current terminal screen, removing all output and history from the display.\n
    Arguments:
      None\n
    Exit Status:
    Returns success (0) after clearing the screen.`;

export default function clear(write, clear) {
    write('', clear); // clears history
  }