package org.example;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.Scanner;

public class EchoClient {

  static void main(String[] args) throws IOException {
    try (Socket socket = new Socket("localhost", 8080);
        BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream(), UTF_8));
        PrintWriter out = new PrintWriter(new OutputStreamWriter(socket.getOutputStream(), UTF_8), true);
        Scanner console = new Scanner(System.in)
    ) {
      System.out.println("Подключились. Пиши сообщения (exit — выход):");
      String line;
      while (!(line = console.nextLine()).equals("exit")) {
        out.println(line);              // отправляем на сервер
        System.out.println("Сервер: " + in.readLine());  // читаем ответ
      }
    }
    System.out.println("Отключились");
  }
}