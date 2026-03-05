import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Button,
  Statistic,
  Row,
  Col,
  Alert,
  Tag,
  Spin,
  Modal,
  message,
  Progress,
  Switch,
  InputNumber,
  Descriptions,
  Space,
  Tabs,
  Table,
  Input,
  Tooltip,
  Typography,
  Collapse,
} from 'antd';
import {
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  DatabaseOutlined,
  UserOutlined,
  BookOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  SearchOutlined,
  EyeOutlined,
  KeyOutlined,
  ClockCircleOutlined,
  ExpandOutlined,
} from '@ant-design/icons';
import {
  refreshModelRegistry,
  getModelInfo,
  getHealthStatus,
  triggerRetrain,
  getOnlineLearningStatus,
  enableOnlineLearning,
  disableOnlineLearning,
  triggerIncrementalUpdate,
  getAvailableRecommendationModels,
  setActiveRecommendationModel,
  getCacheStats,
  clearRecommendationCache,
  getAllRedisCaches,
  getRedisKeyValue,
} from '../../services/recommendationService';
import AdminLayout from '../../layouts/AdminLayout';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

const formatMetricValue = (value, digits = 4) => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return 'N/A';
    }
    return value.toFixed(digits);
  }
  return String(value);
};

const AdminRecommendation = () => {
  const [modelOptions, setModelOptions] = useState([]);
  const [selectedModelKey, setSelectedModelKey] = useState(null);
  const [activeModelKey, setActiveModelKey] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const selectedModel = useMemo(
    () => modelOptions.find((model) => model.key === selectedModelKey),
    [modelOptions, selectedModelKey]
  );
  const activeModel = useMemo(
    () => modelOptions.find((model) => model.key === activeModelKey),
    [modelOptions, activeModelKey]
  );
  const activeModelSupportsOnlineLearning = activeModel?.supportsOnlineLearning ?? false;
  const selectedModelSupportsOnlineLearning = selectedModel?.supportsOnlineLearning ?? false;
  const [modelInfo, setModelInfo] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [onlineLearningStatus, setOnlineLearningStatus] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [bufferSize, setBufferSize] = useState(100);
  const [updatingBuffer, setUpdatingBuffer] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  
  // Redis Inspector states
  const [redisCaches, setRedisCaches] = useState(null);
  const [loadingRedisCaches, setLoadingRedisCaches] = useState(false);
  const [selectedKeyValue, setSelectedKeyValue] = useState(null);
  const [loadingKeyValue, setLoadingKeyValue] = useState(false);
  const [keyValueModalVisible, setKeyValueModalVisible] = useState(false);
  const [selectedKeyName, setSelectedKeyName] = useState('');

  const effectiveModelKey = selectedModelKey ?? activeModelKey ?? 'implicit';
  const isImplicitModel = effectiveModelKey === 'implicit';
  const collaborativeModelLabel = isImplicitModel ? 'ALS' : 'NCF';
  const collaborativeModelFullLabel = isImplicitModel
    ? 'Implicit ALS model'
    : 'Neural Collaborative Filtering (NCF) model';
  const onlineLearningEnabled = onlineLearningStatus?.enabled === true;

  // Load Redis cache details
  const loadRedisCaches = useCallback(async () => {
    setLoadingRedisCaches(true);
    try {
      const data = await getAllRedisCaches();
      setRedisCaches(data);
    } catch (error) {
      console.error('Failed to load Redis caches:', error);
      message.error('Không thể tải chi tiết Redis cache');
    } finally {
      setLoadingRedisCaches(false);
    }
  }, []);

  // View value of a specific key
  const handleViewKeyValue = async (key) => {
    setSelectedKeyName(key);
    setLoadingKeyValue(true);
    setKeyValueModalVisible(true);
    try {
      const value = await getRedisKeyValue(key);
      setSelectedKeyValue(value);
    } catch (error) {
      console.error('Failed to get key value:', error);
      message.error('Không thể lấy giá trị của key');
      setSelectedKeyValue(null);
    } finally {
      setLoadingKeyValue(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initModels = async () => {
      try {
        setLoading(true);
        const { models, activeKey } = await refreshModelRegistry(true);
        if (cancelled) {
          return;
        }
        setModelOptions(models);
        setSelectedModelKey(activeKey);
        setActiveModelKey(activeKey);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load recommendation models:', error);
          message.error('Không thể tải danh sách mô hình gợi ý');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initModels();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadAllData = useCallback(async () => {
    if (!activeModelKey) {
      return;
    }

    setLoading(true);
    try {
      const [info, health, cache] = await Promise.all([
        getModelInfo(),
        getHealthStatus(),
        getCacheStats().catch(() => null),
      ]);
      setModelInfo(info);
      setHealthStatus(health);
      setCacheStats(cache);

      if (activeModelSupportsOnlineLearning) {
        try {
          const olStatus = await getOnlineLearningStatus();
          setOnlineLearningStatus(olStatus);
          if (olStatus && typeof olStatus.buffer_capacity === 'number') {
            setBufferSize(olStatus.buffer_capacity);
          }
        } catch (error) {
          console.error('Failed to get online learning status:', error);
          setOnlineLearningStatus(null);
        }
      } else {
        setOnlineLearningStatus(null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('Không thể tải thông tin hệ thống');
      setModelInfo(null);
      setHealthStatus(null);
      setOnlineLearningStatus(null);
      setCacheStats(null);
    } finally {
      setLoading(false);
    }
  }, [activeModelKey, activeModelSupportsOnlineLearning]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    let interval;

    const isCurrentlyRetraining = modelInfo?.is_retraining === true;

    if (isCurrentlyRetraining) {
      interval = setInterval(loadAllData, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [modelInfo?.is_retraining, loadAllData]);

  useEffect(() => {
    const syncBufferSize = () => {
      if (onlineLearningStatus && typeof onlineLearningStatus.buffer_capacity === 'number') {
        setBufferSize(onlineLearningStatus.buffer_capacity);
      }
    };
    syncBufferSize();
  }, [onlineLearningStatus]);

  const handleModelSwitch = (modelKey) => {
    if (!modelKey || modelKey === selectedModelKey) {
      return;
    }

    setSelectedModelKey(modelKey);
    setActiveTab('overview');
  };

  useEffect(() => {
    if (!selectedModelKey || selectedModelKey === activeModelKey) {
      return;
    }

    let cancelled = false;

    const switchModel = async () => {
      try {
        setLoading(true);
        const info = await setActiveRecommendationModel(selectedModelKey);
        if (cancelled) {
          return;
        }

        setActiveModelKey(info?.key ?? selectedModelKey);
        const updatedModels = await getAvailableRecommendationModels(true);
        if (cancelled) {
          return;
        }

        setModelOptions(updatedModels);
        setModelInfo(null);
        setHealthStatus(null);
        setOnlineLearningStatus(null);
        message.success(`Đã chuyển sang ${info?.label || info?.key || selectedModelKey}`);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to switch recommendation model:', error);
          message.error('Không thể chuyển mô hình gợi ý');
          setSelectedModelKey(activeModelKey);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    switchModel();

    return () => {
      cancelled = true;
    };
  }, [selectedModelKey, activeModelKey]);

  const handleRetrain = () => {
    Modal.confirm({
      title: 'Xác nhận retrain toàn bộ model',
      icon: <WarningOutlined />,
      content: (
        <div>
          <p>Bạn có chắc muốn retrain lại toàn bộ model?</p>
          <p>Quá trình này sẽ:</p>
          <ul>
            <li>Tải lại toàn bộ dữ liệu từ database</li>
            <li>Huấn luyện lại {isImplicitModel ? 'Implicit ALS model' : 'Neural CF model'}</li>
            <li>Huấn luyện lại SBERT model</li>
            <li>Tạo lại user profiles cho SBERT</li>
            <li>Thay thế model hiện tại bằng model mới</li>
          </ul>
          <p><strong>Thời gian ước tính: 2-5 phút</strong></p>
        </div>
      ),
      okText: 'Retrain',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setRetraining(true);
          await triggerRetrain();
          message.success('Đã bắt đầu retrain model! Theo dõi tiến trình bên dưới.');
          await loadAllData();
        } catch (error) {
          console.error('Failed to trigger retrain:', error);
          message.error(error.response?.data?.detail || 'Không thể trigger retrain');
        } finally {
          setRetraining(false);
        }
      },
    });
  };

  const handleOnlineLearningToggle = async (enabled) => {
    if (!selectedModelSupportsOnlineLearning) {
      message.info('Online Learning chưa hỗ trợ cho mô hình này.');
      return;
    }

    try {
      if (enabled) {
        const result = await enableOnlineLearning(bufferSize);
        const appliedSize = result?.buffer_size ?? bufferSize;
        message.success(`Đã bật Online Learning với buffer size = ${appliedSize}`);
        setActiveTab('online-learning');
        setOnlineLearningStatus((prev) => ({
          enabled: true,
          buffer_size: 0,
          buffer_capacity: appliedSize,
          buffer_full: false,
          note:
            result?.note
            ?? prev?.note
            ?? `Only SBERT profiles are updated incrementally. ${collaborativeModelFullLabel} requires full retrain.`,
        }));
      } else {
        await disableOnlineLearning();
        message.success('Đã tắt Online Learning');
        setActiveTab('online-learning');
        setOnlineLearningStatus((prev) => ({
          enabled: false,
          buffer_size: 0,
          buffer_capacity: prev?.buffer_capacity ?? bufferSize,
          buffer_full: false,
          note: 'Online learning disabled.',
        }));
      }
      await loadAllData();
    } catch (error) {
      console.error('Failed to toggle online learning:', error);
      message.error('Không thể thay đổi trạng thái Online Learning');
    }
  };

  const handleApplyBufferSize = async () => {
    if (!selectedModelSupportsOnlineLearning) {
      message.info('Online Learning chưa hỗ trợ cho mô hình này.');
      return;
    }

    try {
      if (bufferSize < 10 || bufferSize > 1000) {
        message.error('Buffer size phải nằm trong khoảng 10-1000');
        return;
      }

      await disableOnlineLearning();
      const result = await enableOnlineLearning(bufferSize);
      const appliedSize = result?.buffer_size ?? bufferSize;
      message.success(`Đã cập nhật buffer size = ${appliedSize}`);
      setActiveTab('online-learning');
      setOnlineLearningStatus((prev) => ({
        ...prev,
        enabled: true,
        buffer_capacity: appliedSize,
        note:
          result?.note
          ?? prev?.note
          ?? `Only SBERT profiles are updated incrementally. ${collaborativeModelFullLabel} requires full retrain.`,
      }));
      await loadAllData();
    } catch (error) {
      console.error('Failed to update buffer size:', error);
      message.error('Không thể cập nhật buffer size');
    }
  };

  const handleIncrementalUpdate = async (force = false) => {
    if (!selectedModelSupportsOnlineLearning) {
      message.info('Online Learning chưa hỗ trợ cho mô hình này.');
      return;
    }

    try {
      setUpdatingBuffer(true);
      const result = await triggerIncrementalUpdate(force);

      if (result.status === 'updated') {
        message.success(`Đã cập nhật SBERT user profiles! (${result.interactions_processed} tương tác)`);
      } else {
        message.info(result.message || 'Không có cập nhật nào được thực hiện');
      }

      await loadAllData();
    } catch (error) {
      console.error('Failed to trigger incremental update:', error);
      message.error(error.response?.data?.detail || 'Không thể trigger update');
    } finally {
      setUpdatingBuffer(false);
    }
  };

  const handleClearCache = () => {
    Modal.confirm({
      title: 'Xác nhận xóa cache',
      icon: <WarningOutlined />,
      content: (
        <div>
          <p>Bạn có chắc muốn xóa toàn bộ cache gợi ý sách?</p>
          <p>Điều này sẽ:</p>
          <ul>
            <li>Xóa cache recommendations cho tất cả users</li>
            <li>Xóa cache similar books cho tất cả sách</li>
            <li>Xóa cache diversity books cho tất cả sách</li>
          </ul>
          <p>Cache sẽ được tạo lại khi có request mới.</p>
        </div>
      ),
      okText: 'Xóa cache',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setClearingCache(true);
          await clearRecommendationCache();
          message.success('Đã xóa toàn bộ cache gợi ý sách');
          await loadAllData();
        } catch (error) {
          console.error('Failed to clear cache:', error);
          message.error('Không thể xóa cache');
        } finally {
          setClearingCache(false);
        }
      },
    });
  };

  const renderStatusTag = () => {
    if (!healthStatus) return null;

    const statusConfig = {
      ok: { color: 'success', icon: <CheckCircleOutlined />, text: 'Hoạt động bình thường' },
      healthy: { color: 'success', icon: <CheckCircleOutlined />, text: 'Hoạt động bình thường' },
      retraining: { color: 'processing', icon: <SyncOutlined spin />, text: 'Đang retrain...' },
      no_model: { color: 'warning', icon: <WarningOutlined />, text: 'Model chưa được load' },
      error: { color: 'error', icon: <WarningOutlined />, text: 'Lỗi' },
    };

    const config = statusConfig[healthStatus.status] || statusConfig.error;

    return (
      <Tag icon={config.icon} color={config.color} style={{ fontSize: 14, padding: '4px 12px' }}>
        {config.text}
      </Tag>
    );
  };

  const renderOverviewStats = () => {
    if (!modelInfo) {
      return null;
    }

    if (selectedModelKey === 'implicit') {
      return (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Hybrid Alpha"
                value={modelInfo?.alpha || 0}
                precision={2}
                prefix={<LineChartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                ALS: {((modelInfo?.alpha || 0) * 100).toFixed(0)}% | SBERT: {((1 - (modelInfo?.alpha || 0)) * 100).toFixed(0)}%
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="ALS Users"
                value={modelInfo?.cf_model?.num_users || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                Collaborative Filtering
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="SBERT Books"
                value={modelInfo?.content_model?.num_books || 0}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                Content-Based
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="User Profiles"
                value={modelInfo?.content_model?.num_user_profiles || 0}
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                SBERT Profiles (Online Learning)
              </div>
            </Card>
          </Col>
        </Row>
      );
    }

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hybrid Alpha"
              value={modelInfo?.alpha || 0}
              precision={2}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              NCF: {((modelInfo?.alpha || 0) * 100).toFixed(0)}% | SBERT: {((1 - (modelInfo?.alpha || 0)) * 100).toFixed(0)}%
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="NCF Users"
              value={modelInfo?.ncf_model?.num_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              Neural Collaborative Filtering
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="NCF Items"
              value={modelInfo?.ncf_model?.num_items || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              Dataset coverage
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="SBERT Profiles"
              value={modelInfo?.content_model?.num_user_profiles || 0}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              SBERT Users | Books: {modelInfo?.content_model?.num_books || 0}
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderModelDetails = () => {
    if (!modelInfo) {
      return null;
    }

    const ncfTrainingParams = modelInfo?.ncf_model?.training_params ?? {};
    const ncfEvaluationMetrics = modelInfo?.ncf_model?.evaluation_metrics;
    const ncfLastTrainingLoss = modelInfo?.ncf_model?.last_training_loss;

    if (selectedModelKey === 'implicit') {
      return (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={(
                <span>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Implicit ALS Model
                </span>
              )}
              extra={
                modelInfo?.cf_model ? (
                  <Tag color="success">Active</Tag>
                ) : (
                  <Tag color="default">Not Loaded</Tag>
                )
              }
            >
              {modelInfo?.cf_model ? (
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Users">
                    {modelInfo.cf_model.num_users?.toLocaleString?.() ?? modelInfo.cf_model.num_users}
                  </Descriptions.Item>
                  <Descriptions.Item label="Items">
                    {modelInfo.cf_model.num_items?.toLocaleString?.() ?? modelInfo.cf_model.num_items}
                  </Descriptions.Item>
                  <Descriptions.Item label="Factors">
                    {modelInfo.cf_model.factors ?? 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Iterations">
                    {modelInfo.cf_model.iterations ?? 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Regularization">
                    {modelInfo.cf_model.regularization ?? 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Matrix NNZ">
                    {modelInfo.cf_model.matrix_nnz?.toLocaleString?.() ?? modelInfo.cf_model.matrix_nnz}
                  </Descriptions.Item>
                  <Descriptions.Item label="Density">
                    {(
                      (modelInfo.cf_model.matrix_nnz
                        / Math.max(1, (modelInfo.cf_model.num_users || 1) * (modelInfo.cf_model.num_items || 1)))
                      * 100
                    ).toFixed(4)}%
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  <DatabaseOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <p>Model chưa được load</p>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={(
                <span>
                  <BookOutlined style={{ marginRight: 8 }} />
                  SBERT Model
                </span>
              )}
              extra={
                modelInfo?.content_model ? (
                  <Tag color="success">Active</Tag>
                ) : (
                  <Tag color="default">Not Loaded</Tag>
                )
              }
            >
              {modelInfo?.content_model ? (
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Model Name">
                    {modelInfo.content_model.model_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Books">
                    {modelInfo.content_model.num_books?.toLocaleString?.() ?? modelInfo.content_model.num_books}
                  </Descriptions.Item>
                  <Descriptions.Item label="User Profiles">
                    {modelInfo.content_model.num_user_profiles?.toLocaleString?.() ?? modelInfo.content_model.num_user_profiles}
                  </Descriptions.Item>
                  <Descriptions.Item label="Embedding Dim">
                    {modelInfo.content_model.embedding_dim || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  <DatabaseOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <p>Model chưa được load</p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={(
              <span>
                <UserOutlined style={{ marginRight: 8 }} />
                Neural CF (NCF)
              </span>
            )}
            extra={
              modelInfo?.ncf_model ? (
                <Tag color="success">Active</Tag>
              ) : (
                <Tag color="default">Not Loaded</Tag>
              )
            }
          >
            {modelInfo?.ncf_model ? (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Users">
                  {modelInfo.ncf_model.num_users?.toLocaleString?.() ?? modelInfo.ncf_model.num_users}
                </Descriptions.Item>
                <Descriptions.Item label="Items">
                  {modelInfo.ncf_model.num_items?.toLocaleString?.() ?? modelInfo.ncf_model.num_items}
                </Descriptions.Item>
                <Descriptions.Item label="GMF Dimension">
                  {modelInfo.ncf_model.gmf_dim ?? 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="MLP Layers">
                  {modelInfo.ncf_model.mlp_dims && modelInfo.ncf_model.mlp_dims.length > 0
                    ? modelInfo.ncf_model.mlp_dims.join(' → ')
                    : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Epochs">
                  {ncfTrainingParams.epochs ?? 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Dropout">
                  {formatMetricValue(ncfTrainingParams.dropout)}
                </Descriptions.Item>
                <Descriptions.Item label="Learning Rate">
                  {formatMetricValue(ncfTrainingParams.learning_rate, 6)}
                </Descriptions.Item>
                <Descriptions.Item label="Weight Decay">
                  {formatMetricValue(ncfTrainingParams.weight_decay, 6)}
                </Descriptions.Item>
                <Descriptions.Item label="Batch Size">
                  {ncfTrainingParams.batch_size ?? 'N/A'}
                </Descriptions.Item>
                {ncfLastTrainingLoss !== undefined && ncfLastTrainingLoss !== null && (
                  <Descriptions.Item label="Last Training Loss">
                    {formatMetricValue(ncfLastTrainingLoss, 6)}
                  </Descriptions.Item>
                )}
                {ncfEvaluationMetrics && Object.keys(ncfEvaluationMetrics).length > 0 && (
                  <Descriptions.Item label="Evaluation Metrics">
                    {Object.entries(ncfEvaluationMetrics).map(([metric, value]) => (
                      <div key={metric}>
                        <strong>{metric}:</strong> {formatMetricValue(value, 6)}
                      </div>
                    ))}
                  </Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <DatabaseOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>Model chưa được load</p>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={(
              <span>
                <BookOutlined style={{ marginRight: 8 }} />
                SBERT Model
              </span>
            )}
            extra={
              modelInfo?.content_model ? (
                <Tag color="success">Active</Tag>
              ) : (
                <Tag color="default">Not Loaded</Tag>
              )
            }
          >
            {modelInfo?.content_model ? (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Model Name">
                  {modelInfo.content_model.model_name}
                </Descriptions.Item>
                <Descriptions.Item label="Books">
                  {modelInfo.content_model.num_books?.toLocaleString?.() ?? modelInfo.content_model.num_books}
                </Descriptions.Item>
                <Descriptions.Item label="User Profiles">
                  {modelInfo.content_model.num_user_profiles?.toLocaleString?.() ?? modelInfo.content_model.num_user_profiles}
                </Descriptions.Item>
                <Descriptions.Item label="Embedding Dim">
                  {modelInfo.content_model.embedding_dim || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <DatabaseOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>Model chưa được load</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Hệ thống gợi ý">
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: '#666' }}>Đang tải thông tin model...</p>
        </div>
      </AdminLayout>
    );
  }

  const isRetraining = modelInfo?.is_retraining || healthStatus?.status === 'retraining';
  const modelsLoaded = healthStatus?.models_loaded;
  const bufferCapacity = onlineLearningStatus?.buffer_capacity || 0;
  const bufferSizeValue = onlineLearningStatus?.buffer_size || 0;
  const bufferProgress = onlineLearningStatus?.enabled && bufferCapacity > 0
    ? Math.min(100, (bufferSizeValue / bufferCapacity) * 100)
    : 0;
  const onlineLearningTagColor = !selectedModelSupportsOnlineLearning
    ? 'default'
    : onlineLearningStatus
      ? (onlineLearningEnabled ? 'green' : 'default')
      : 'gold';
  const onlineLearningTagText = !selectedModelSupportsOnlineLearning
    ? 'Online Learning: Không hỗ trợ'
    : onlineLearningStatus
      ? `Online Learning: ${onlineLearningEnabled ? 'Bật' : 'Tắt'}`
      : 'Online Learning: Đang tải';

  const overviewTabContent = (
    <>
      {renderOverviewStats()}
      
      {/* Cache Statistics */}
      <Card
        title={(
          <span>
            <DatabaseOutlined style={{ marginRight: 8 }} />
            Redis Cache Statistics
          </span>
        )}
        extra={(
          <Button
            danger
            loading={clearingCache}
            onClick={handleClearCache}
            icon={<ReloadOutlined />}
          >
            Xóa toàn bộ cache
          </Button>
        )}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Recommendations Cache"
              value={cacheStats?.recommendationsCount ?? 0}
              prefix={<UserOutlined />}
              suffix="keys"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Similar Books Cache"
              value={cacheStats?.similarBooksCount ?? 0}
              prefix={<BookOutlined />}
              suffix="keys"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Diversity Books Cache"
              value={cacheStats?.diversityBooksCount ?? 0}
              prefix={<ThunderboltOutlined />}
              suffix="keys"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
        </Row>
        
        {/* Button to load cache details */}
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={loadingRedisCaches}
              onClick={loadRedisCaches}
            >
              Xem chi tiết các keys
            </Button>
          </Space>
        </div>

        {/* Cache Details Table */}
        {redisCaches && (
          <Collapse defaultActiveKey={['recommendations', 'similarBooks', 'diversityBooks']} style={{ marginTop: 16 }}>
            {Object.entries(redisCaches).map(([cacheName, keys]) => (
              <Panel 
                header={
                  <span>
                    <KeyOutlined style={{ marginRight: 8 }} />
                    {cacheName} ({keys?.length || 0} keys)
                  </span>
                } 
                key={cacheName}
              >
                {keys && keys.length > 0 ? (
                  <Table
                    dataSource={keys}
                    rowKey="key"
                    size="small"
                    pagination={{ pageSize: 5, size: 'small' }}
                    columns={[
                      {
                        title: 'Key',
                        dataIndex: 'key',
                        key: 'key',
                        width: '40%',
                        render: (text) => (
                          <Tooltip title={text}>
                            <Text ellipsis style={{ maxWidth: 300 }}>{text}</Text>
                          </Tooltip>
                        ),
                      },
                      {
                        title: 'Type',
                        dataIndex: 'type',
                        key: 'type',
                        width: '10%',
                        render: (type) => <Tag color="blue">{type}</Tag>,
                      },
                      {
                        title: 'TTL',
                        dataIndex: 'ttlSeconds',
                        key: 'ttlSeconds',
                        width: '15%',
                        render: (ttl) => (
                          <span>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {ttl > 0 ? `${Math.floor(ttl / 60)}m ${ttl % 60}s` : 'No expiry'}
                          </span>
                        ),
                      },
                      {
                        title: 'Value Type',
                        dataIndex: 'valueType',
                        key: 'valueType',
                        width: '15%',
                        render: (type) => <Tag color="green">{type}</Tag>,
                      },
                      {
                        title: 'Preview',
                        dataIndex: 'valuePreview',
                        key: 'valuePreview',
                        width: '15%',
                        render: (preview) => (
                          <Tooltip title={preview}>
                            <Text ellipsis style={{ maxWidth: 150 }}>{preview}</Text>
                          </Tooltip>
                        ),
                      },
                      {
                        title: 'Actions',
                        key: 'actions',
                        width: '10%',
                        render: (_, record) => (
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewKeyValue(record.key)}
                            size="small"
                          >
                            Xem
                          </Button>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <Alert message="Không có key nào trong cache này" type="info" />
                )}
              </Panel>
            ))}
          </Collapse>
        )}

        <Alert
          message="Cache được tự động xóa khi model retrain hoặc khi online learning update profiles"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>

      {/* Key Value Modal */}
      <Modal
        title={
          <span>
            <KeyOutlined style={{ marginRight: 8 }} />
            Chi tiết Key: {selectedKeyName}
          </span>
        }
        open={keyValueModalVisible}
        onCancel={() => {
          setKeyValueModalVisible(false);
          setSelectedKeyValue(null);
          setSelectedKeyName('');
        }}
        footer={[
          <Button key="close" onClick={() => setKeyValueModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {loadingKeyValue ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
          </div>
        ) : selectedKeyValue ? (
          <div>
            <Paragraph>
              <Text strong>Key: </Text>
              <Text code copyable>{selectedKeyName}</Text>
            </Paragraph>
            <Paragraph>
              <Text strong>Value (JSON):</Text>
            </Paragraph>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: 16, 
              borderRadius: 8,
              maxHeight: 400,
              overflow: 'auto',
              fontSize: 12,
            }}>
              {JSON.stringify(selectedKeyValue, null, 2)}
            </pre>
          </div>
        ) : (
          <Alert message="Không thể lấy giá trị của key này" type="warning" />
        )}
      </Modal>
      
      {renderModelDetails()}
    </>
  );

  const onlineLearningTabContent = selectedModelSupportsOnlineLearning ? (
    <>
      <Alert
        message="Lưu ý về Online Learning"
        description={(
          <div>
            <p><strong>Online Learning chỉ cập nhật SBERT user profiles</strong>, không cập nhật {collaborativeModelFullLabel}.</p>
            <p>Để cập nhật {collaborativeModelLabel} model, bạn cần thực hiện <strong>Retrain Toàn Bộ</strong>.</p>
          </div>
        )}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={(
              <span>
                <SettingOutlined style={{ marginRight: 8 }} />
                Điều khiển Online Learning
              </span>
            )}
          >
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Trạng thái:</span>
                <Switch
                  checked={onlineLearningStatus?.enabled}
                  onChange={handleOnlineLearningToggle}
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                />
              </div>

              {onlineLearningStatus?.enabled && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                      Buffer Progress: {onlineLearningStatus.buffer_size} / {onlineLearningStatus.buffer_capacity}
                    </div>
                    <Progress
                      percent={bufferProgress}
                      status={onlineLearningStatus.buffer_full ? 'exception' : 'active'}
                      strokeColor={onlineLearningStatus.buffer_full ? '#ff4d4f' : '#1890ff'}
                    />
                    {onlineLearningStatus.buffer_full && (
                      <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>
                        ⚠️ Buffer đã đầy! Nên trigger update ngay.
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleIncrementalUpdate(false)}
                      loading={updatingBuffer}
                      disabled={!onlineLearningStatus.buffer_full}
                      block
                    >
                      Trigger Update (khi buffer đầy)
                    </Button>
                  </div>

                  <div>
                    <Button
                      type="default"
                      danger
                      icon={<ThunderboltOutlined />}
                      onClick={() => handleIncrementalUpdate(true)}
                      loading={updatingBuffer}
                      block
                    >
                      Force Update Now (bất kể buffer)
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={(
              <span>
                <DatabaseOutlined style={{ marginRight: 8 }} />
                Cấu hình Buffer
              </span>
            )}
          >
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                Buffer Size (10-1000)
              </div>
              <InputNumber
                value={bufferSize}
                onChange={setBufferSize}
                min={10}
                max={1000}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                Số lượng tương tác tích lũy trước khi trigger update tự động
              </div>
            </div>

            <Button
              type="primary"
              onClick={handleApplyBufferSize}
              disabled={!onlineLearningStatus?.enabled}
              block
            >
              Áp dụng Buffer Size
            </Button>

            {onlineLearningStatus?.note && (
              <Alert
                message={onlineLearningStatus.note}
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title="Về Online Learning"
        style={{ marginTop: 16 }}
      >
        <div style={{ fontSize: 14, lineHeight: 1.8 }}>
          <h4>🚀 Online Learning là gì?</h4>
          <p>
            Online Learning cho phép hệ thống cập nhật <strong>SBERT user profiles</strong> một cách
            incremental (từng phần) mà không cần retrain toàn bộ model. Điều này giúp:
          </p>
          <ul>
            <li>Cập nhật nhanh theo tương tác người dùng mới</li>
            <li>Tiết kiệm thời gian (không cần retrain toàn bộ)</li>
            <li>Cải thiện recommendations theo thời gian thực</li>
          </ul>

          <h4>📊 Cách hoạt động:</h4>
          <ol>
            <li>Hệ thống thu thập tương tác người dùng vào <strong>buffer</strong></li>
            <li>Khi buffer đầy (đạt buffer_size), tự động trigger update</li>
            <li>Hoặc bạn có thể <strong>Force Update</strong> bất kỳ lúc nào</li>
            <li>Chỉ SBERT user profiles được cập nhật, {collaborativeModelFullLabel} model giữ nguyên</li>
          </ol>

          <h4>⚠️ Hạn chế:</h4>
          <ul>
            <li>Chỉ cập nhật SBERT, không cập nhật {collaborativeModelFullLabel}</li>
            <li>Để cập nhật {collaborativeModelLabel}, cần Retrain Toàn Bộ</li>
            <li>Buffer size nên chọn phù hợp với lượng tương tác (10-1000)</li>
          </ul>
        </div>
      </Card>
    </>
  ) : (
    <Alert
      message="Online Learning chưa hỗ trợ cho mô hình này"
      description={(
        <div>
          <p>Hiện tại mô hình <strong>{selectedModel?.label || 'đang chọn'}</strong> chưa có workflow incremental.</p>
          <p>Vui lòng sử dụng <strong>Retrain Toàn Bộ</strong> để cập nhật model.</p>
        </div>
      )}
      type="warning"
      showIcon
    />
  );

  const tabItems = [
    {
      key: 'overview',
      label: 'Tổng quan',
      children: overviewTabContent,
    },
    {
      key: 'online-learning',
      label: (
        <span>
          <ThunderboltOutlined />
          Online Learning
        </span>
      ),
      children: onlineLearningTabContent,
    },
  ];

  return (
    <AdminLayout title="Hệ thống gợi ý">
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 500 }}>Chọn Model hoạt động:</span>
          <Space.Compact>
            {modelOptions.map((model) => (
              <Button
                key={model.key}
                type={model.key === selectedModelKey ? 'primary' : 'default'}
                onClick={() => handleModelSwitch(model.key)}
              >
                {model.label || model.key}
              </Button>
            ))}
          </Space.Compact>

          {selectedModel && (
            <>
              <Tag color={onlineLearningTagColor}>{onlineLearningTagText}</Tag>
              {selectedModel.baseUrl && (
                <Tag color="geekblue">API: {selectedModel.baseUrl}</Tag>
              )}
            </>
          )}
        </div>
        {selectedModel?.description && (
          <div style={{ marginTop: 8, color: '#666' }}>
            {selectedModel.description}
          </div>
        )}
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>{renderStatusTag()}</div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadAllData}
          >
            Làm mới
          </Button>

          <Button
            type="primary"
            danger
            icon={<SyncOutlined />}
            onClick={handleRetrain}
            loading={retraining}
            disabled={isRetraining || !modelsLoaded}
          >
            {isRetraining ? 'Đang retrain...' : 'Retrain Toàn Bộ'}
          </Button>
        </div>
      </div>

      {isRetraining && (
        <Alert
          message="Model đang được retrain"
          description={(
            <div>
              <p>Hệ thống đang huấn luyện lại toàn bộ model với dữ liệu mới nhất...</p>
              <Progress percent={undefined} status="active" />
              <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                Trang này sẽ tự động cập nhật mỗi 3 giây
              </p>
            </div>
          )}
          type="info"
          showIcon
          icon={<SyncOutlined spin />}
          style={{ marginBottom: 24 }}
        />
      )}

      {!modelsLoaded && !isRetraining && (
        <Alert
          message="Model chưa được load"
          description="Hệ thống chưa có model. Vui lòng retrain để tạo model mới."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={tabItems}
      />
    </AdminLayout>
  );
};

export default AdminRecommendation;
