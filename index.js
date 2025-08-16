import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('EventManagerApp', () => App);
AppRegistry.runApplication('EventManagerApp', {
  rootTag: document.getElementById('root')
});
