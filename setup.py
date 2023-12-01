from distutils.core import setup
setup(
   name='AiStudyBuddy',
   version='0.1',
   packages=["pipenv",
"beautifulsoup4==4.12.2",
"lxml==4.9.3",
"numpy==1.26.2",
"packaging==23.2",
"Pillow==10.1.0",
"PyPDF2==3.0.1",
"PyMuPDFb==1.23.6",
"pytesseract==0.3.10",
"python-magic==0.4.27; 'linux' in sys.platform",
"python-magic-bin==0.4.14; sys_platform == 'win32'",
"python-pptx==0.6.23",
"XlsxWriter==3.1.9",
"Flask==3.0.0",
"Flask-Login==0.6.3",
"aiohttp==3.9.0",
"aiosignal==1.3.1",
"annotated-types==0.6.0",
"anyio==3.7.1",
"attrs==23.1.0",
"backoff==2.2.1",
"bcrypt==4.0.1",
"cachetools==5.3.2",
"certifi==2023.11.17",
"cffi==1.16.0",
"charset-normalizer==3.3.2",
"chroma-hnswlib==0.7.3",
"chromadb==0.4.17",
"click==8.1.7",
"colorama==0.4.6",
"coloredlogs==15.0.1",
"cryptography==41.0.5",
"dataclasses-json==0.6.2",
"datasets==2.15.0",
"Deprecated==1.2.14",
"dill==0.3.7",
"diskcache==5.6.3",
"distro==1.8.0",
"fastapi==0.104.1",
"filelock==3.13.1",
"flatbuffers==23.5.26",
"frozenlist==1.4.0",
"fsspec==2023.10.0",
"google-auth==2.23.4",
"googleapis-common-protos==1.61.0",
"gptcache==0.1.42",
"greenlet==3.0.1",
"grpcio==1.59.3",
"guidance==0.1.3",
"h11==0.14.0",
"httpcore==1.0.2",
"httptools==0.6.1",
"httpx==0.25.1",
"huggingface-hub==0.19.4",
"humanfriendly==10.0",
"idna==3.4",
"importlib-metadata==6.8.0",
"importlib-resources==6.1.1",
"Jinja2==3.1.2",
"joblib==1.3.2",
"jsonpatch==1.33",
"jsonpointer==2.4",
"kubernetes==28.1.0",
"langchain==0.0.339",
"langsmith==0.0.66",
"llama_cpp_python==0.2.19",
"MarkupSafe==2.1.3",
"marshmallow==3.20.1",
"monotonic==1.6",
"mpmath==1.3.0",
"msal==1.25.0",
"multidict==6.0.4",
"multiprocess==0.70.15",
"mypy-extensions==1.0.0",
"nest-asyncio==1.5.8",
"networkx==3.2.1",
"nltk==3.8.1",
"numpy==1.26.2",
"oauthlib==3.2.2",
"onnxruntime==1.16.3",
"openai==1.3.5",
"opentelemetry-api==1.21.0",
"opentelemetry-exporter-otlp-proto-common==1.21.0",
"opentelemetry-exporter-otlp-proto-grpc==1.21.0",
"opentelemetry-proto==1.21.0",
"opentelemetry-sdk==1.21.0",
"opentelemetry-semantic-conventions==0.42b0",
"ordered-set==4.1.0",
"overrides==7.4.0",
"packaging==23.2",
"pandas==2.1.3",
"Pillow==10.1.0",
"platformdirs==4.0.0",
"posthog==3.0.2",
"protobuf==4.25.1",
"pulsar-client==3.3.0",
"pyarrow==14.0.1",
"pyarrow-hotfix==0.5",
"pyasn1==0.5.1",
"pyasn1-modules==0.3.0",
"pycparser==2.21",
"pydantic==2.5.1",
"pydantic_core==2.14.3",
"pydot==1.4.2",
"pyformlang==1.0.4",
"PyJWT==2.8.0",
"pyparsing==3.1.1",
"PyPika==0.48.9",
"pyreadline3==3.4.1",
"python-dateutil==2.8.2",
"python-dotenv==1.0.0",
"pytz==2023.3.post1",
"PyYAML==6.0.1",
"regex==2023.10.3",
"requests==2.31.0",
"requests-oauthlib==1.3.1",
"rsa==4.9",
"safetensors==0.4.0",
"scikit-learn==1.3.2",
"scipy==1.11.4",
"sentence-transformers==2.2.2",
"sentencepiece==0.1.99",
"six==1.16.0",
"sniffio==1.3.0",
"SQLAlchemy==2.0.23",
"starlette==0.27.0",
"sympy==1.12",
"tenacity==8.2.3",
"threadpoolctl==3.2.0",
"tiktoken==0.5.1",
"tokenizers==0.15.0",
"torch==2.1.1",
"torchvision==0.16.1",
"tqdm==4.66.1",
"transformers==4.35.2",
"typer==0.9.0",
"typing-inspect==0.9.0",
"typing_extensions==4.8.0",
"tzdata==2023.3",
"urllib3==1.26.18",
"uvicorn==0.24.0.post1",
"watchfiles==0.21.0",
"websocket-client==1.6.4",
"websockets==12.0",
"wrapt==1.16.0",
"xxhash==3.4.1",
"yarl==1.9.3",
"zipp==3.17.0",
"openai==1.3.5"]",
   license='MIT',
   long_description=open('README.txt').read(),
   classifiers=[
    'Development Status :: 3 - Alpha',

    'Intended Audience :: Cool guys',
    'Topic :: Software Development :: Build Tools',
    'License :: OSI Approved :: MIT License',

    'Programming Language :: Python :: 3.9',
    'Programming Language :: Python :: 3.10',
],
)