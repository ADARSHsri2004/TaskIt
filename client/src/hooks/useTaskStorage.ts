import { useCallback } from 'react';

const DB_NAME = 'TaskItDB';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const idb = (event.target as IDBOpenDBRequest).result;
      if (!idb.objectStoreNames.contains(STORE_NAME)) {
        const store = idb.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
    };
  });
};

export const useTaskStorage = () => {
  const addTask = useCallback(
    async (task: any) => {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(task);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    },
    []
  );

  const updateTask = useCallback(
    async (task: any) => {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(task);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    },
    []
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(taskId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    },
    []
  );

  const getTask = useCallback(
    async (taskId: string) => {
      const database = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(taskId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    },
    []
  );

  const getAllTasks = useCallback(async () => {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, []);

  const clearAllTasks = useCallback(async () => {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, []);

  return {
    addTask,
    updateTask,
    deleteTask,
    getTask,
    getAllTasks,
    clearAllTasks
  };
};
