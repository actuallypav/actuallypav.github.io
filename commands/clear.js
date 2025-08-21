export const description = `clear: clear
    Clear the terminal screen.

    Arguments:
        None

    Exit Status:
        0  after clearing the screen.`;

export default function clear(write, clear) {
    write('', clear); // clears history
  }