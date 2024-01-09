import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { saveTodo, getTodos } from './API';

const window = Dimensions.get('window');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getTodos().then((storedTodos) => setTodos(storedTodos));
  }, []);

  const showToast = (message) => {
    Toast.show({
      type: 'error',
      position: 'bottom',
      text1: message,
      visibilityTime: 2000,
    });
  };

  const addTodo = async () => {
    if (!text.trim()) {
      showToast('Task text cannot be empty');
      return;
    }

    const newTodos = [
      ...todos,
      { text, id: Date.now(), completed: false, date: date.toISOString() },
    ];
    setTodos(newTodos);
    saveTodo(newTodos);
    setText('');
    setDate(new Date());
    setModalVisible(false);

    // Set a notification for the chosen date and time
    const trigger = new Date(date);
    if (Platform.OS === 'ios') {
      trigger.setSeconds(trigger.getSeconds() + 5);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Todo Reminder',
        body: `Don't forget to complete your task: ${text}`,
      },
      trigger,
    });
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const deleteTodo = () => {
    const newTodos = todos.filter((todo) => todo.id !== selectedTodo.id);
    setTodos(newTodos);
    saveTodo(newTodos);
    setModalVisible(false);
  };

  const openDeleteModal = (todo) => {
    setSelectedTodo(todo);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openDeleteModal(item)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
        <Text style={{ marginLeft: 8 }}>
          {item.text} - Due: {new Date(item.date).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 20, marginTop: 20 }}>
      <Button title="+" onPress={() => setModalVisible(true)} />
      <FlatList data={todos} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, margin: 20 }}>
            <Text>Add Task</Text>
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginBottom: 10,
                padding: 8,
              }}
              placeholder="Type your todo here"
              value={text}
              onChangeText={(inputText) => setText(inputText)}
            />
            <View style={{ marginBottom: 10 }}>
              <Button title="Set Due Date" onPress={showDatepicker} />
            </View>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="datetime"
                is24Hour={true}
                display="default"
                onChange={onChangeDate}
              />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Add" onPress={addTodo} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isModalVisible}>
        <View style={{ padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
          <Text>Are you sure you want to delete this task?</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
            <Button title="Delete" onPress={deleteTodo} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default App;
