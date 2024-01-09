import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveTodo = async (todos) => {
  try {
    await AsyncStorage.setItem('todos', JSON.stringify(todos));
  } catch (e) {
    console.error('Error saving todos:', e);
  }
};

export const getTodos = async () => {
  try {
    const todos = await AsyncStorage.getItem('todos');
    return todos != null ? JSON.parse(todos) : [];
  } catch (e) {
    console.error('Error getting todos:', e);
    return [];
  }
};
