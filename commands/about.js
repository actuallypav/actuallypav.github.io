export const description = `about\n
    Display information about the terminal.\n
    Shows information about this fake Ubuntu terminal built in JavaScript.\n
    Arguments:
      None\n
    Exit Status:
    Returns success (0) after displaying the information.`;


export default function about(write) {
    write('This is a fake Ubuntu terminal built in JS. Useb by pav as a portfolio/cv website. Almost done give me like 48hours');
  }