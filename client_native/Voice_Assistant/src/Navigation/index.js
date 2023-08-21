import 'react-native-gesture-handler'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen2 from '../screens/HomeScreen2';

const Drawer = createDrawerNavigator();

export default function AppNavigation(){
    return(
        <NavigationContainer>
            <Drawer.Navigator initialRouteName='Home'>
                <Drawer.Screen name = "New Chat" component={HomeScreen2}/>

            </Drawer.Navigator>
        </NavigationContainer>
    )
}