const React = require('react');

const MockIcon = (props) => React.createElement('LucideIcon', props);

module.exports = new Proxy(
  { __esModule: true },
  {
    get(target, property) {
      return property in target ? target[property] : MockIcon;
    },
  },
);
