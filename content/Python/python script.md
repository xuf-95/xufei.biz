---
title: python script
tags:
  - script
date: 2022-08-01
draft: false
---
### 斐波那契 

```python
#!/usr/bin/python3 

import sys def fibonacci(n): 
# 生成器函数 - 斐波那契 

a, b, counter = 0, 1, 0 
while True: if (counter > n): 
	return yield a a, b = b, a + b 
	counter += 1 
f = fibonacci(10) # f 是一个迭代器，由生成器返回生成 while True: try: print (next(f), end=" ") except StopIteration: sys.exit()
```


### Check whether the specified IP and port are connectable.

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import socket
import sys

def check_port(ip, port, timeout=5):
    """
    w检查指定 IP 和端口是否可连接
    :param ip: 目标 IP 地址 (字符串)
    :param port: 目标端口号 (整数)
    :param timeout: 超时时间（秒）
    :return: True 表示通，False 表示不通
    """
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)  # 设置超时
        result = sock.connect_ex((ip, port))  # 返回 0 表示成功
        sock.close()
        return result == 0
    except socket.gaierror:
        print(f"无法解析 IP 地址: {ip}")
        return False
    except Exception as e:
        print(f"发生异常: {e}")
        return False

def main():
    ip = '172.30.0.14'
    port = 11434

    print(f"正在检测 {ip}:{port} ...")
    
    if check_port(ip, port):
        print(f"{ip}:{port} 是通的 ")
    else:
        print(f" {ip}:{port} 不通或连接超时 ")

if __name__ == "__main__":
    main()
```