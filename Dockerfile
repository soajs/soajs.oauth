FROM soajsorg/node

RUN mkdir -p /opt/soajs/soajs.oauth/node_modules/
WORKDIR /opt/soajs/soajs.oauth/
COPY . .
RUN npm install

CMD ["/bin/bash"]