package org.example;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class SimpleClient {

  static void main(String[] args) throws IOException {
    // 1. Подключаемся к серверу localhost:8080
    try (Socket socket = new Socket("localhost", 8080)) {
      System.out.println("Подключились к серверу");

      // 2. Отправляем сообщение
      PrintWriter out = new PrintWriter(
          socket.getOutputStream(), true
      );
      out.println("Привет, сервер!");

      // 3. Читаем ответ
      BufferedReader in = new BufferedReader(
          new InputStreamReader(socket.getInputStream())
      );
      String response = in.readLine();
      System.out.println("Ответ сервера: " + response);
    }
    System.out.println("Клиент завершил работу");
  }
}