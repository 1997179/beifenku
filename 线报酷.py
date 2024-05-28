import requests
from bs4 import BeautifulSoup
import schedule
import time

# 抓取最新文章函数
def fetch_latest_article():
    article_info = None

    try:
        url = "http://new.xianbao.fun"
        response = requests.get(url)
        
        # 检查HTTP响应状态码是否为200
        if response.status_code != 200:
            print(f"错误：无法访问网站，状态码：{response.status_code}")
            return article_info

        soup = BeautifulSoup(response.content, 'html.parser')

        # 定位包含文章的<ul>标签
        articles_list = soup.find('ul', class_='new-post')
        
        if not articles_list:
            print("错误：未找到文章列表。请检查选择器是否正确。")
            return article_info

        # 调试输出以确认找到的<ul>标签内容
        print(f"找到<ul>标签内容: {articles_list}")

        # 获取最新文章<li>（第一个<li>标签）
        latest_article = articles_list.find('li', class_='article-list newer newest')
        
        if not latest_article:
            print("错误：未找到任何文章。请检查选择器是否正确。")
            return article_info

        # 调试输出以确认找到的<li>标签内容
        print(f"找到<li>标签内容: {latest_article}")

        # 获取文章标题和链接
        title_link = latest_article.find('a')
        title = title_link['title'] if title_link else '无法获取标题'
        link = title_link['href'] if title_link else '无法获取链接'
        
        # 获取时间戳
        time_element = latest_article.find('time')
        timestamp = time_element['datetime'] if time_element else '无法获取时间'
        
        # 获取评论数量
        comments_element = latest_article.find('span', class_='badge com')
        comments = comments_element.text.strip() if comments_element else '无法获取评论数'
        
        # 添加文章信息到字典
        article_info = {
            'title': title,
            'link': link,
            'timestamp': timestamp,
            'comments': comments
        }

    except Exception as e:
        print(f"抓取文章时发生错误：{e}")

    return article_info

# 定时任务函数
def job():
    print("开始抓取最新文章...")

    article = fetch_latest_article()

    if article:
        print("抓取最新文章完成。以下是抓取到的文章信息：")
        print(f"标题: {article['title']}\n链接: {article['link']}\n时间: {article['timestamp']}\n评论数: {article['comments']}\n---")
    else:
        print("没有抓取到最新文章。")

# 每10秒运行一次
schedule.every(10).seconds.do(job)

while True:
    schedule.run_pending()
    time.sleep(1)  # 等待一秒后继续检查任务