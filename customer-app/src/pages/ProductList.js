import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Input, Pagination, Spin, Empty, Card, Select, Button, Space, Tag, Divider } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  SortAscendingOutlined,
  FireOutlined,
  StarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { storefrontAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import './ProductList.css';

const { Option } = Select;

const CATEGORY_OPTIONS = [
  { value: 'drinks', label: 'Đồ uống' },
  { value: 'snacks', label: 'Bánh kẹo' },
  { value: 'dairy', label: 'Sữa & Sản phẩm từ sữa' },
  { value: 'instant', label: 'Mì ăn liền' },
  { value: 'frozen', label: 'Đồ đông lạnh' },
  { value: 'household', label: 'Đồ gia dụng' },
  { value: 'personalcare', label: 'Chăm sóc cá nhân' },
  { value: 'groceries', label: 'Tạp hóa' }
];

const PRICE_RANGE_OPTIONS = [
  { value: '0-10000', label: 'Dưới 10.000đ' },
  { value: '10000-25000', label: '10.000đ - 25.000đ' },
  { value: '25000-50000', label: '25.000đ - 50.000đ' },
  { value: '50000-100000', label: '50.000đ - 100.000đ' },
  { value: '100000-999999', label: 'Trên 100.000đ' }
];

const ProductList = ({ onCartUpdate }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const initialCategory = urlParams.get('category') || undefined;
  const initialCategoryOpt = initialCategory
    ? CATEGORY_OPTIONS.find(o => o.value === initialCategory)
    : undefined;
  const initialTags = urlParams.get('tags') || undefined;
  const initialTimeOfDay = urlParams.get('timeOfDay') || undefined;
  const [filters, setFilters] = useState({
    category: initialCategoryOpt,
    tags: initialTags,
    timeOfDay: initialTimeOfDay,
    sortBy: 'name',
    sortOrder: 'asc',
    priceRange: undefined
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const dropdownContainer = useCallback(() => document.body, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    const tags = params.get('tags');
    const timeOfDay = params.get('timeOfDay');
    const priceRange = params.get('priceRange');
    const searchParam = params.get('search') || params.get('q') || '';
    const next = {};
    if (cat) next.category = CATEGORY_OPTIONS.find(o => o.value === cat);
    if (tags) next.tags = tags;
    if (timeOfDay) next.timeOfDay = timeOfDay;
    if (priceRange) next.priceRange = PRICE_RANGE_OPTIONS.find(o => o.value === priceRange);
    if (Object.keys(next).length > 0) setFilters(prev => ({ ...prev, ...next }));
    if (searchParam !== undefined) {
      setSearchText(searchParam);
      setPagination(prev => ({ ...prev, page: 1 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchProducts();
    }, 150);
    return () => clearTimeout(t);
  }, [pagination.page, searchText, filters]);

  // Removed auto-scroll to avoid potential layout thrashing while interacting with dropdowns

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        q: searchText,
        category: filters.category?.value,
        tags: filters.tags,
        timeOfDay: filters.timeOfDay,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        priceRange: filters.priceRange?.value,
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await storefrontAPI.getProducts(params);
      setProducts(response.data.items || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total
      }));
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    const normalized = value === '' || value === null ? undefined : value;
    setFilters(prev => ({ ...prev, [key]: normalized }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: undefined,
      tags: undefined,
      timeOfDay: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
      priceRange: undefined
    });
    setSearchText('');
    setPagination(prev => ({ ...prev, page: 1 }));
    const params = new URLSearchParams(location.search);
    params.delete('category');
    params.delete('tags');
    params.delete('timeOfDay');
    params.delete('search');
    params.delete('q');
    navigate({ pathname: '/products', search: params.toString() });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category?.value) count++;
    if (filters.tags) count++;
    if (filters.timeOfDay) count++;
    if (filters.priceRange?.value) count++;
    if (filters.sortBy !== 'name' || filters.sortOrder !== 'asc') count++;
    return count;
  };

  return (
    <div className="product-list-page">
      <div className="page-header">
        <h1>Danh sách sản phẩm</h1>
        <Space size="middle">
          <Input.Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ maxWidth: 400 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={<FilterOutlined />}
            size="large"
            onClick={() => setShowFilters(prev => !prev)}
            type={showFilters ? 'primary' : 'default'}
          >
            Bộ lọc {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
          </Button>
        </Space>
      </div>

      {/* Filters Panel */}
      <div style={{ display: showFilters ? 'block' : 'none' }}>
        <Card className="filters-panel" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <label>Danh mục:</label>
              <Select
                placeholder="Chọn danh mục"
                style={{ width: '100%' }}
                labelInValue
                value={filters.category}
                onChange={(opt) => { handleFilterChange('category', opt); }}
                getPopupContainer={dropdownContainer}
                virtual={false}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ zIndex: 2000 }}
                listHeight={256}
                allowClear
                options={CATEGORY_OPTIONS}
                optionFilterProp="label"
                optionLabelProp="label"
                showSearch
                placement="bottomLeft"
              />
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <label>Sắp xếp theo:</label>
              <Select
                style={{ width: '100%' }}
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-');
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                getPopupContainer={dropdownContainer}
                virtual={false}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ zIndex: 2000 }}
                listHeight={256}
              >
                <Option value="name-asc">Tên A-Z</Option>
                <Option value="name-desc">Tên Z-A</Option>
                <Option value="price-asc">Giá thấp đến cao</Option>
                <Option value="price-desc">Giá cao đến thấp</Option>
                <Option value="stock-asc">Tồn kho ít nhất</Option>
                <Option value="stock-desc">Tồn kho nhiều nhất</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <label>Khoảng giá:</label>
              <Select
                placeholder="Chọn khoảng giá"
                style={{ width: '100%' }}
                labelInValue
                value={filters.priceRange}
                onChange={(opt) => { handleFilterChange('priceRange', opt); }}
                getPopupContainer={dropdownContainer}
                virtual={false}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ zIndex: 2000 }}
                listHeight={256}
                allowClear
                options={PRICE_RANGE_OPTIONS}
                optionFilterProp="label"
                optionLabelProp="label"
                showSearch
                placement="bottomLeft"
              />
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <Space>
                <Button onClick={clearFilters}>
                  Xóa bộ lọc
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="results-summary">
          <Space>
            <span>Tìm thấy <strong>{pagination.total}</strong> sản phẩm (Hiển thị: {products.length})</span>
            {searchText && (
              <Tag closable onClose={() => setSearchText('')}>
                Tìm kiếm: "{searchText}"
              </Tag>
            )}
            {filters.category?.value && (
              <Tag closable onClose={() => handleFilterChange('category', undefined)}>
                Danh mục: {filters.category?.label}
              </Tag>
            )}
            {filters.tags && (
              <Tag closable onClose={() => handleFilterChange('tags', undefined)} color="pink">
                Tags: {filters.tags}
              </Tag>
            )}
            {filters.timeOfDay && (
              <Tag closable onClose={() => handleFilterChange('timeOfDay', undefined)} color="orange">
                Khung giờ: {filters.timeOfDay === 'morning' ? 'Buổi sáng' : filters.timeOfDay === 'afternoon' ? 'Buổi chiều' : filters.timeOfDay === 'evening' ? 'Buổi tối' : 'Khuya'}
              </Tag>
            )}
            {filters.priceRange?.value && (
              <Tag closable onClose={() => handleFilterChange('priceRange', undefined)}>
                Giá: {filters.priceRange?.label}
              </Tag>
            )}
          </Space>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : products.length === 0 ? (
        <Empty 
          description={`Không tìm thấy sản phẩm (Đã load: ${products.length} sản phẩm)`}
          style={{ padding: '100px 0' }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
          <Button type="default" onClick={fetchProducts} style={{ marginLeft: 8 }}>
            Thử lại
          </Button>
        </Empty>
      ) : (
        <>
          <div style={{ marginBottom: '100px' }}>
            <Row gutter={[16, 16]}>
              {products.map((product, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={product.id || index}>
                  <ProductCard product={product} onCartUpdate={onCartUpdate} />
                </Col>
              ))}
            </Row>
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Pagination
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.limit}
              onChange={(page) => setPagination(prev => ({ ...prev, page }))}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} của ${total} sản phẩm`
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;