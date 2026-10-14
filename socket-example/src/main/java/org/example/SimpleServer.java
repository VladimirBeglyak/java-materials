package org.example;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

public class SimpleServer {

  static void main(String[] args) throws IOException {
    // 1. Создаём серверный сокет на порту 8080
    try (ServerSocket serverSocket = new ServerSocket(8080)) {
      System.out.println("Сервер слушает порт 8080...");

      // 2. accept() блокируется, пока не придёт клиент
      try (Socket clientSocket = serverSocket.accept()) {
        System.out.println("Клиент подключился: " + clientSocket.getInetAddress());

        // 3. Читаем строку от клиента
        BufferedReader in = new BufferedReader(
            new InputStreamReader(clientSocket.getInputStream())
        );
        String message = in.readLine();
        System.out.println("Получено: " + message);

        // 4. Отправляем ответ
        PrintWriter out = new PrintWriter(
            clientSocket.getOutputStream(), true
        );
        out.println("Привет, клиент! Ты сказал: " + message);
      }
    }
    System.out.println("Сервер завершил работу");
  }
}