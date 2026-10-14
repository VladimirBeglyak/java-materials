package org.example;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;

public class MultiServer {

  static void main(String[] args) throws IOException {
    try (ServerSocket serverSocket = new ServerSocket(8080)) {
      System.out.println("Сервер слушает 8080...");

      while (true) {                       // бесконечный цикл — принимаем всех
        Socket client = serverSocket.accept();
        System.out.println("Клиент: " + client.getInetAddress());

        // обрабатываем клиента в отдельном потоке
        new Thread(() -> handle(client)).start();
      }
    }
  }

  private static void handle(Socket client) {
    try (
        client;
        BufferedReader in = new BufferedReader(new InputStreamReader(client.getInputStream(), UTF_8));
        PrintWriter out = new PrintWriter(new OutputStreamWriter(client.getOutputStream(), UTF_8), true)
    ) {
      String line;
      while ((line = in.readLine()) != null) {   // пока клиент шлёт строки
        System.out.println("Получено: " + line);
        out.println("Эхо: " + line);            // отвечаем
      }
    } catch (IOException e) {
      System.err.println("Ошибка: " + e.getMessage());
    }
    // здесь client автоматически закроется (try-with-resources)
  }
}